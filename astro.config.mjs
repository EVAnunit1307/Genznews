import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Production URL — update once the Vercel domain is final.
// Used for canonical links, sitemap, and OpenGraph share previews.
const SITE = 'https://genznews.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    preact({ compat: true }),
    // applyBaseStyles: false — we own the Tailwind entry in src/styles/global.css
    // so custom base styles (liquid-glass, mobile resets) load in a predictable order.
    tailwind({ applyBaseStyles: false }),
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
});
