// One-off: renders PNG app icons from an inline SVG using sharp (already a dep
// via Astro's image service). Run: `node scripts/gen-icons.mjs`
import sharp from 'sharp';

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text x="50%" y="53%" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${Math.round(
    size * 0.6
  )}" fill="#ffffff" text-anchor="middle" dominant-baseline="central">g</text>
</svg>`;

const targets = [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/apple-touch-icon.png', 180],
];

for (const [file, size] of targets) {
  await sharp(Buffer.from(svg(size))).png().toFile(file);
  console.log('wrote', file);
}

// Default OpenGraph card (1200×630) for the home + category pages.
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#000000"/>
  <text x="90" y="300" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="130" fill="#ffffff">genzthinks</text>
  <rect x="96" y="345" width="70" height="7" fill="#ff2d2d"/>
  <text x="96" y="405" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#ffffff" opacity="0.65">A solo Gen Z magazine</text>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile('public/og-default.png');
console.log('wrote public/og-default.png');

