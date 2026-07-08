// Site-wide, non-secret constants. (All API keys live in Vercel env vars / serverless — never here.)

export const SITE = {
  name: 'genzthinks',
  title: 'genzthinks — a Gen Z magazine',
  description:
    'A solo Gen Z magazine: original writing on the policy, climate, tech, money, culture, and fashion stories shaping our generation.',
  // Owner's display name for bylines. Edit this to your name.
  author: 'genzthinks',
  // Update once the final Vercel domain is set (also update astro.config.mjs `site`).
  url: 'https://genznews.vercel.app',
  // GitHub repo — used by Giscus comments + Sveltia CMS.
  repo: 'EVANunit1307/Genznews',
  // Giscus comments. Get these from https://giscus.app AFTER you:
  //   1. make the repo public, 2. enable Discussions, 3. install the giscus app.
  // These are PUBLIC identifiers (safe to commit) — not secrets.
  giscus: {
    repoId: '', // e.g. 'R_kgDOxxxxxx'
    category: 'Announcements', // the Discussions category giscus should use
    categoryId: '', // e.g. 'DIC_kwDOxxxxxx'
  },
};

// Topic pills — order matters. `id` is used in URLs (/[category]); `label` is shown.
export const TOPICS = [
  { id: 'all', label: 'All' },
  { id: 'global', label: 'Global' },
  { id: 'us', label: 'US' },
  { id: 'canada', label: 'Canada' },
  { id: 'climate', label: 'Climate' },
  { id: 'tech', label: 'Tech' },
  { id: 'money', label: 'Money' },
  { id: 'culture', label: 'Culture' },
  { id: 'policy', label: 'Policy' },
  { id: 'fashion', label: 'Fashion' },
] as const;

// The article categories (Title-case) that match the content schema enum.
export const CATEGORIES = [
  'Global',
  'US',
  'Canada',
  'Climate',
  'Tech',
  'Money',
  'Culture',
  'Policy',
  'Fashion',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Hero ticker watchlist (no ETH, varied mix). `label` is the ticker display symbol.
// Wired to real Finnhub prices via /api/stocks in Phase 4.
export const WATCHLIST = [
  { symbol: 'AAPL', label: 'AAPL', kind: 'stock' },
  { symbol: 'TSLA', label: 'TSLA', kind: 'stock' },
  { symbol: 'NVDA', label: 'NVDA', kind: 'stock' },
  { symbol: 'GOOGL', label: 'GOOGL', kind: 'stock' },
  { symbol: 'AMD', label: 'AMD', kind: 'stock' },
  { symbol: 'COIN', label: 'COIN', kind: 'stock' },
  { symbol: 'SPY', label: 'S&P 500', kind: 'stock' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC', kind: 'crypto' },
] as const;

// Background videos (reused from the original site).
export const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4',
  secondary:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4',
};
