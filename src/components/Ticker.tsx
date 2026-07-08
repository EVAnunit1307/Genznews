import { useEffect, useState } from 'react';

interface Quote {
  symbol: string;
  label: string;
  price: number;
  changePct: number;
}

// Mock values shown instantly; replaced by real Finnhub prices from /api/stocks (Phase 4).
const MOCK: Quote[] = [
  { symbol: 'AAPL', label: 'AAPL', price: 227.3, changePct: 1.2 },
  { symbol: 'TSLA', label: 'TSLA', price: 342.15, changePct: -0.8 },
  { symbol: 'NVDA', label: 'NVDA', price: 168.4, changePct: 2.4 },
  { symbol: 'GOOGL', label: 'GOOGL', price: 191.05, changePct: 0.5 },
  { symbol: 'AMD', label: 'AMD', price: 172.9, changePct: -1.1 },
  { symbol: 'COIN', label: 'COIN', price: 388.2, changePct: 3.2 },
  { symbol: 'SPY', label: 'S&P 500', price: 6180, changePct: 0.3 },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC', price: 96420, changePct: 1.8 },
];

function fmtPrice(n: number): string {
  return n >= 1000
    ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK);

  useEffect(() => {
    let alive = true;
    fetch('/api/stocks')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && Array.isArray(data) && data.length) setQuotes(data);
      })
      .catch(() => {
        /* keep mock */
      });
    return () => {
      alive = false;
    };
  }, []);

  const items = quotes.map((q) => {
    const up = q.changePct >= 0;
    return (
      <span key={q.symbol} className="inline-flex items-center gap-1.5 px-4">
        <span className="text-white/85 font-medium">{q.label}</span>
        <span className="text-white/55">{fmtPrice(q.price)}</span>
        <span style={{ color: up ? '#7CFFB2' : '#ff6b6b' }}>
          {up ? '▲' : '▼'} {Math.abs(q.changePct).toFixed(1)}%
        </span>
        <span className="text-white/15">·</span>
      </span>
    );
  });

  return (
    <div className="overflow-hidden">
      {/* duplicated once for a seamless -50% scroll loop */}
      <div className="ticker-track text-[11px] font-body">
        {items}
        {items}
      </div>
    </div>
  );
}
