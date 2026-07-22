import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = [
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

// Treat the empty strings / nulls the CMS emits for blank optional fields as "unset".
const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: () =>
    z.object({
      title: z.string(),
      dek: z.string().optional(),
      category: z.enum(CATEGORIES),
      publishedAt: z.coerce.date(),
      // Sveltia CMS writes unset optional fields as null or '' — normalize those to
      // undefined so `.optional()` passes and the app's own fallbacks apply
      // (e.g. read time auto-estimates from the body when left blank).
      updatedAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
      // Stored as a plain filename string and resolved at render time via
      // src/lib/heroImage.ts. The schema's image() helper would fail the ENTIRE
      // build if the CMS references an image that was deleted or not yet
      // uploaded; a string keeps the build resilient (missing = monogram fallback).
      heroImage: z.preprocess(emptyToUndefined, z.string().optional()),
      readTime: z.preprocess(emptyToUndefined, z.number().optional()),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { articles };
