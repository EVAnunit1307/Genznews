import type { VercelRequest, VercelResponse } from '@vercel/node';

// US stocks / ETFs via Finnhub; BTC via CoinGecko (free, no key). No keys ever
// reach the browser — this proxy runs server-side on Vercel.
const STOCKS = [
  { symbol: 'AAPL', label: 'AAPL' },
  { symbol: 'TSLA', label: 'TSLA' },
  { symbol: 'NVDA', label: 'NVDA' },
  { symbol: 'GOOGL', label: 'GOOGL' },
  { symbol: 'AMD', label: 'AMD' },
  { symbol: 'COIN', label: 'COIN' },
  { symbol: 'SPY', label: 'S&P 500' },
];

async function finnhubQuote(symbol: string, key: string) {
  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`
    );
    if (!r.ok) return null;
    const d = (await r.json()) as { c?: number; dp?: number };
    if (typeof d.c !== 'number' || d.c === 0) return null;
    return { price: d.c, changePct: typeof d.dp === 'number' ? d.dp : 0 };
  } catch {
    return null;
  }
}

async function btcQuote() {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
    );
    if (!r.ok) return null;
    const d = (await r.json()) as { bitcoin?: { usd: number; usd_24h_change?: number } };
    if (!d.bitcoin) return null;
    return { price: d.bitcoin.usd, changePct: d.bitcoin.usd_24h_change ?? 0 };
  } catch {
    return null;
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // CDN-cache so we hit Finnhub at most ~once/minute regardless of traffic.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const key = process.env.FINNHUB_KEY;
  try {
    const [stocks, btc] = await Promise.all([
      key
        ? Promise.all(
            STOCKS.map(async (s) => {
              const q = await finnhubQuote(s.symbol, key);
              return q ? { symbol: s.symbol, label: s.label, ...q } : null;
            })
          )
        : Promise.resolve([]),
      btcQuote(),
    ]);

    const out = [
      ...stocks.filter(Boolean),
      ...(btc ? [{ symbol: 'BTC', label: 'BTC', ...btc }] : []),
    ];

    // Empty array → the client Ticker keeps its mock values.
    res.status(200).json(out);
  } catch {
    res.status(200).json([]);
  }
}
