// One-off: renders PNG app icons + the OpenGraph card from inline SVG using sharp
// (already a dep via Astro's image service). Run: `node scripts/gen-icons.mjs`
//
// The mark is the site globe (matches favicon.svg + the in-app SVG logos). Keeping
// all of these in one script means the brand stays consistent everywhere: browser
// tab, iOS/Android home screen, PWA, and social-share previews.
import sharp from 'sharp';

const INK = '#0a0a0b';
const ACCENT = '#ff2d2d';

// Globe drawn in a 24×24 box, centred on (12,12) with radius 9 (candidate "C":
// equator + two parallels + a meridian ellipse — reads clearly even at ~20px).
const GLOBE_PATHS = `
  <circle cx="12" cy="12" r="9" />
  <path d="M3.6 12h16.8" />
  <path d="M5 7.4h14" />
  <path d="M5 16.6h14" />
  <ellipse cx="12" cy="12" rx="4.5" ry="9" />`;

// Place the 24-box globe centred at (cx,cy) with the outer circle scaled to `diameter`.
// Stroke stays ~5% of the globe so weight looks identical at every size.
function globe(cx, cy, diameter, stroke = '#ffffff') {
  const s = diameter / 18; // circle diameter in the 24-box is 18 units (r=9)
  const tx = cx - 12 * s;
  const ty = cy - 12 * s;
  return `<g transform="translate(${tx} ${ty}) scale(${s})" fill="none" stroke="${stroke}"
    stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round">${GLOBE_PATHS}</g>`;
}

// ── square app icons (full-bleed ink so the OS can mask/round freely) ──
const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}" />
  ${globe(size / 2, size / 2, size * 0.58)}
</svg>`;

const targets = [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/apple-touch-icon.png', 180],
];

for (const [file, size] of targets) {
  await sharp(Buffer.from(iconSvg(size))).png().toFile(file);
  console.log('wrote', file);
}

// ── default OpenGraph card (1200×630) — globe mark + wordmark + Canadian-lens line ──
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${INK}" />
  ${globe(600, 208, 150)}
  <text x="600" y="398" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="128" fill="#ffffff" text-anchor="middle">genzthinks</text>
  <rect x="545" y="424" width="110" height="8" rx="4" fill="${ACCENT}" />
  <text x="600" y="486" font-family="Arial, Helvetica, sans-serif" font-size="33" fill="#ffffff" opacity="0.62" text-anchor="middle">Politics, policy &amp; ideas — through a Canadian lens</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile('public/og-default.png');
console.log('wrote public/og-default.png');
