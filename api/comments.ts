import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'node:crypto';

// Works with either Vercel KV or a direct Upstash Redis integration — the same
// store already powering reactions + newsletter, so no extra setup.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Optional moderation secret. When set, DELETE requires a matching token so the
// writer can remove a comment; when unset, deletion is disabled (fail closed).
const MOD_TOKEN = process.env.COMMENTS_ADMIN_TOKEN || '';

const SLUG_RE = /^[a-z0-9-]{1,120}$/i;
const keyFor = (slug: string) => `comments:${slug}`;
const rlKey = (ip: string) => `cmt:rl:${ip}`;

const NAME_MAX = 40;
const BODY_MAX = 1500;
const BODY_MIN = 2;
const MAX_RETURN = 200; // hard cap on how many comments we ever return
const RL_MAX = 6; // max new comments per window, per IP
const RL_WINDOW = 300; // seconds (5 min)
const LINK_MAX = 2; // reject comments with more than N links (spam guard)

interface Comment {
  id: string;
  name: string;
  body: string;
  ts: number;
}

/** Strip control chars (keep newlines/tabs), collapse runs, trim, clamp length. */
function cleanText(s: unknown, max: number): string {
  return String(s ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Count likely links — explicit URLs plus a conservative set of spammy TLDs. */
function countLinks(s: string): number {
  const m = s.match(
    /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|ru|xyz|info|biz|shop|top|link|click|online|site)\b/gi
  );
  return m ? m.length : 0;
}

function clientIp(req: VercelRequest): string {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || String(req.headers['x-real-ip'] || '') || 'unknown';
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

/** Constant-time token comparison (avoids leaking match position via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Parse a stored hash into a validated array, newest first. */
function parseComments(raw: Record<string, unknown> | null | undefined): Comment[] {
  if (!raw) return [];
  const out: Comment[] = [];
  for (const v of Object.values(raw)) {
    try {
      const c = (typeof v === 'string' ? JSON.parse(v) : v) as Partial<Comment>;
      if (c && typeof c.id === 'string' && typeof c.body === 'string') {
        out.push({
          id: c.id,
          name: typeof c.name === 'string' && c.name ? c.name : 'Anonymous',
          body: c.body,
          ts: Number(c.ts) || 0,
        });
      }
    } catch {
      /* skip malformed entry */
    }
  }
  out.sort((a, b) => b.ts - a.ts);
  return out.slice(0, MAX_RETURN);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug ?? '');
  if (!SLUG_RE.test(slug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  // Not configured yet (e.g. local preview) → render empty, accept nothing.
  if (!redis) {
    res.status(200).json({ slug, comments: [], disabled: true });
    return;
  }

  try {
    // ── list ──
    if (!req.method || req.method === 'GET') {
      const comments = parseComments(await redis.hgetall(keyFor(slug)));
      res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=30');
      res.status(200).json({ slug, comments, count: comments.length });
      return;
    }

    // ── add ──
    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

      // Honeypot: real users never fill this. Pretend success, store nothing.
      if (cleanText(data.website, 100)) {
        res.status(200).json({ ok: true, skipped: true });
        return;
      }

      const name = cleanText(data.name, NAME_MAX) || 'Anonymous';
      const body = cleanText(data.body, BODY_MAX);

      if (body.length < BODY_MIN) {
        res.status(400).json({ error: 'Say a little more.' });
        return;
      }
      if (countLinks(body) > LINK_MAX) {
        res.status(400).json({ error: 'Too many links — drop the spam.' });
        return;
      }

      // Fixed-window rate limit per IP.
      const rk = rlKey(clientIp(req));
      const n = await redis.incr(rk);
      if (n === 1) await redis.expire(rk, RL_WINDOW);
      if (n > RL_MAX) {
        res.status(429).json({ error: "You're posting fast — give it a minute." });
        return;
      }

      const comment: Comment = { id: crypto.randomUUID(), name, body, ts: Date.now() };
      await redis.hset(keyFor(slug), { [comment.id]: comment });
      res.status(200).json({ ok: true, comment });
      return;
    }

    // ── moderate: delete ──
    if (req.method === 'DELETE') {
      if (!MOD_TOKEN) {
        res.status(501).json({ error: 'Moderation not configured' });
        return;
      }
      const provided = String(req.headers['x-mod-token'] || req.query.token || '');
      if (!provided || !safeEqual(provided, MOD_TOKEN)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      const bodyId =
        typeof req.body === 'string' ? safeParse(req.body).id : (req.body || {}).id;
      const id = String(req.query.id ?? bodyId ?? '');
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }
      await redis.hdel(keyFor(slug), id);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch {
    res.status(200).json({ slug, comments: [], error: true });
  }
}
