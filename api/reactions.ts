import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Works with either Vercel KV or a direct Upstash Redis integration.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Reaction ids — KEEP IN SYNC with src/components/Reactions.tsx and the card
// enhancer in src/components/SocialProof.astro.
const REACTIONS = ['fire', 'facts', 'mind', 'eyes', 'respect'] as const;
type ReactionId = (typeof REACTIONS)[number];

const SLUG_RE = /^[a-z0-9-]{1,120}$/i;
const keyFor = (slug: string) => `reactions:${slug}`;

type Counts = Partial<Record<ReactionId, number>>;

/** Keep only known reactions with positive integer counts. */
function clean(raw: Record<string, unknown> | null | undefined): Counts {
  const out: Counts = {};
  if (!raw) return out;
  for (const id of REACTIONS) {
    const n = Number(raw[id] ?? 0);
    if (Number.isFinite(n) && n > 0) out[id] = Math.round(n);
  }
  return out;
}

/** Total across all reactions + the single most-used one (for card social proof). */
function summarize(counts: Counts) {
  let total = 0;
  let top: { id: ReactionId; count: number } | null = null;
  for (const id of REACTIONS) {
    const n = counts[id] ?? 0;
    if (n > 0) {
      total += n;
      if (!top || n > top.count) top = { id, count: n };
    }
  }
  return { total, top };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── batch read for the feed: /api/reactions?slugs=a,b,c ──
  const slugsParam = req.query.slugs;
  if (typeof slugsParam === 'string' && slugsParam.length) {
    const slugs = Array.from(
      new Set(
        slugsParam
          .split(',')
          .map((s) => s.trim())
          .filter((s) => SLUG_RE.test(s))
      )
    ).slice(0, 60);

    if (!redis || !slugs.length) {
      res.status(200).json({ items: {}, disabled: !redis });
      return;
    }
    try {
      const pipe = redis.pipeline();
      slugs.forEach((s) => pipe.hgetall(keyFor(s)));
      const rows = (await pipe.exec()) as (Record<string, unknown> | null)[];
      const items: Record<string, ReturnType<typeof summarize>> = {};
      slugs.forEach((s, i) => {
        items[s] = summarize(clean(rows[i]));
      });
      res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=60');
      res.status(200).json({ items });
    } catch {
      res.status(200).json({ items: {}, error: true });
    }
    return;
  }

  // ── single article read / write ──
  const slug = String(req.query.slug ?? '');
  if (!SLUG_RE.test(slug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  // Not configured yet → degrade gracefully so the UI still renders.
  if (!redis) {
    res.status(200).json({ slug, counts: {}, disabled: true });
    return;
  }

  try {
    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const id = String(body.id || '') as ReactionId;
      const delta = body.delta === -1 ? -1 : 1;
      if (!REACTIONS.includes(id)) {
        res.status(400).json({ error: 'Invalid reaction' });
        return;
      }
      const next = await redis.hincrby(keyFor(slug), id, delta);
      // never let a count go negative (double un-tap / races)
      if (next < 0) await redis.hset(keyFor(slug), { [id]: 0 });
      const counts = clean(await redis.hgetall(keyFor(slug)));
      res.status(200).json({ slug, counts });
      return;
    }

    const counts = clean(await redis.hgetall(keyFor(slug)));
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=60');
    res.status(200).json({ slug, counts });
  } catch {
    res.status(200).json({ slug, counts: {}, error: true });
  }
}
