import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Works with either Vercel KV or a direct Upstash Redis integration.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const SLUG_RE = /^[a-z0-9-]{1,120}$/i;
const keyFor = (slug: string) => `likes:${slug}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug ?? '');
  if (!SLUG_RE.test(slug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  // Not configured yet → degrade gracefully so the button still renders.
  if (!redis) {
    res.status(200).json({ slug, likes: 0, disabled: true });
    return;
  }

  try {
    if (req.method === 'POST') {
      const likes = await redis.incr(keyFor(slug));
      res.status(200).json({ slug, likes });
      return;
    }
    const likes = (await redis.get<number>(keyFor(slug))) ?? 0;
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=60');
    res.status(200).json({ slug, likes });
  } catch {
    res.status(200).json({ slug, likes: 0, error: true });
  }
}
