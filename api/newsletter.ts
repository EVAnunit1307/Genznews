import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Works with either Vercel KV or a direct Upstash Redis integration.
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = kvUrl && kvToken ? new Redis({ url: kvUrl, token: kvToken }) : null;

// Prefers Buttondown; otherwise captures the email in Upstash KV (the same store
// used for likes) so no signups are lost — zero extra setup. Keys stay server-side.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const buttondownKey = process.env.BUTTONDOWN_KEY;

  // 1) Buttondown — handles confirmation, sending, and unsubscribes.
  if (buttondownKey) {
    try {
      const r = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: { Authorization: `Token ${buttondownKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email }),
      });
      if (r.ok) {
        res.status(200).json({ ok: true });
        return;
      }
      const text = await r.text();
      if (r.status === 400 && /already|exists|subscrib/i.test(text)) {
        res.status(200).json({ ok: true, already: true });
        return;
      }
      // otherwise fall through to the KV fallback below
    } catch {
      // fall through to KV
    }
  }

  // 2) Fallback — store the email in Upstash KV so nothing is lost.
  if (redis) {
    try {
      await redis.sadd('subscribers', email);
      res.status(200).json({ ok: true, stored: true });
      return;
    } catch {
      res.status(502).json({ error: 'Subscribe failed' });
      return;
    }
  }

  res.status(500).json({ error: 'Newsletter not configured' });
}
