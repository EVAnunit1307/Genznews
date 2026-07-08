import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = [
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

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dek: z.string().optional(),
      category: z.enum(CATEGORIES),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      heroImage: image().optional(),
      readTime: z.number().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { articles };
