import type { ImageMetadata } from 'astro';

// Every image that lives alongside the article markdown, loaded eagerly so a CMS
// `heroImage` string (e.g. "IMG_1744.jpeg") can be matched to real, optimizable
// image metadata at build time.
//
// Why not the content schema's `image()` helper? Because it resolves the path
// while loading content and throws `[ImageNotFound]`, failing the ENTIRE build,
// whenever a referenced file was deleted or simply hasn't been uploaded yet. The
// CMS commits markdown and media in separate steps (and its media cleanup can
// remove files other articles still point at), so that dangling window is
// common. Matching against this map instead means a missing file just returns
// `undefined`, and the article falls back to its monogram card while the build
// stays green — and it self-heals the moment the image is (re)uploaded.
const heroFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../content/articles/*.{jpeg,jpg,png,webp,avif,gif,JPEG,JPG,PNG,WEBP,AVIF,GIF}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(heroFiles)) {
  const name = path.split('/').pop();
  if (name) byName.set(name, mod.default);
}

/**
 * Resolve a CMS `heroImage` filename to Astro image metadata.
 * Returns `undefined` for blank, missing, or not-yet-uploaded images so callers
 * can fall back gracefully instead of breaking the build.
 */
export function resolveHero(heroImage?: string | null): ImageMetadata | undefined {
  if (!heroImage) return undefined;
  const name = heroImage.split('/').pop();
  return name ? byName.get(name) : undefined;
}
