import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real quotes from Yahoo Finance — FREE, no API key required. Runs server-side
// on Vercel only, so nothing sensitive reaches the browser. Works out of the box
// on deploy with zero configuration. FINNHUB_KEY (optional) is only used as a
// fallback for individual stocks if Yahoo is momentarily unavailable.
const WATCHLIST = [
  { symbol: 'AAPL', label: 'AAPL' },
  { symbol: 'TSLA', label: 'TSLA' },
  { symbol: 'NVDA', label: 'NVDA' },
  { symbol: 'GOOGL', label: 'GOOGL' },
  { symbol: 'AMD', label: 'AMD' },
  { symbol: 'COIN', label: 'COIN' },
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: 'BTC-USD', label: 'BTC' },
];

interface Quote {
  price: number;
  changePct: number;
}

async function yahooQuote(symbol: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=1d&range=1d`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return null;
    const data = (await r.json()) as {
      chart?: {
        result?: Array<{
          meta?: { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number };
        }>;
      };
    };
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    return { price, changePct: prev ? ((price - prev) / prev) * 100 : 0 };
  } catch {
    return null;
  }
}

async function finnhubQuote(symbol: string, key: string): Promise<Quote | null> {
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

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // CDN-cache so upstream is hit at most ~once/minute regardless of traffic.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const finnhubKey = process.env.FINNHUB_KEY;

  try {
    const quotes = await Promise.all(
      WATCHLIST.map(async (w) => {
        let q = await yahooQuote(w.symbol);
        // Optional Finnhub fallback — skip index (^) and crypto (-) symbols it can't resolve.
        if (!q && finnhubKey && !w.symbol.startsWith('^') && !w.symbol.includes('-')) {
          q = await finnhubQuote(w.symbol, finnhubKey);
        }
        return q ? { symbol: w.symbol, label: w.label, price: q.price, changePct: q.changePct } : null;
      })
    );

    // Empty array → the client Ticker keeps its mock values.
    res.status(200).json(quotes.filter(Boolean));
  } catch {
    res.status(200).json([]);
  }
}
