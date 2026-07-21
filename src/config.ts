// Site-wide, non-secret constants. (All API keys live in Vercel env vars / serverless — never here.)

import about from './data/about.json';
import site from './data/site.json';

export const SITE = {
  name: 'genzthinks',
  title: 'genzthinks — a Gen Z magazine',
  // Meta/SEO description — editable in the CMS via /admin → Pages → Home & Site Text.
  description: site.description,
  // Writer identity — single source of truth is src/data/about.json so it can be
  // edited from the CMS (/admin → Pages → About) and stays in sync across every
  // byline, author card, and the About section.
  author: about.authorName,
  authorRole: about.authorRole,
  // Short byline bio — used on the article author sign-off card.
  authorBio: about.authorBio,
  linkedin: about.linkedin,
  // Update once the final Vercel domain is set (also update astro.config.mjs `site`).
  url: 'https://genznews.vercel.app',
  // GitHub repo — used by the Sveltia CMS at /admin.
  repo: 'EVAnunit1307/Genznews',
  // Legacy Giscus IDs — comments now run first-party on Upstash (api/comments.ts),
  // so these are unused. Kept only so the old Giscus.astro can be restored if ever
  // wanted. Safe to delete. These are PUBLIC identifiers, never secrets.
  giscus: {
    repoId: 'R_kgDOSXd0AQ',
    category: 'Announcements',
    categoryId: 'DIC_kwDOSXd0Ac4DBIv_',
  },
};

// Topic pills — order matters. `id` is used in URLs (/[category]); `label` is shown.
// Canadian-first ordering reflects the site's lens.
export const TOPICS = [
  { id: 'all', label: 'All' },
  { id: 'canada', label: 'Canada' },
  { id: 'international-relations', label: 'International relations' },
  { id: 'international-trade', label: 'International trade' },
  { id: 'policy', label: 'Policy' },
  { id: 'climate', label: 'Climate' },
  { id: 'tech', label: 'Tech' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'arts', label: 'Arts' },
  { id: 'fashion', label: 'Fashion' },
] as const;

// The article categories (Title-case) that match the content schema enum.
// Keep this in sync with the enum in src/content/config.ts and the CMS dropdown
// in public/admin/config.yml.
export const CATEGORIES = [
  'Canada',
  'International relations',
  'International trade',
  'Policy',
  'Climate',
  'Tech',
  'Philosophy',
  'Arts',
  'Fashion',
] as const;

export type Category = (typeof CATEGORIES)[number];

// The hero ticker's symbols live server-side in api/stocks.ts (real quotes from
// Yahoo Finance — free, no key). Edit that watchlist to change the ticker.

// Background videos (reused from the original site).
export const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4',
  secondary:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4',
};
