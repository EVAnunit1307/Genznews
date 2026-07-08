import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.dek ?? '',
      pubDate: a.data.publishedAt,
      link: `/article/${a.id}/`,
      categories: [a.data.category],
    })),
    customData: `<language>en-us</language>`,
  });
}
