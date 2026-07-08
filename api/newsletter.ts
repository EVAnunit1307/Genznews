import type { VercelRequest, VercelResponse } from '@vercel/node';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Subscribes an email to Buttondown. The API key stays server-side.
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

  const key = process.env.BUTTONDOWN_KEY;
  if (!key) {
    res.status(500).json({ error: 'Newsletter not configured' });
    return;
  }

  try {
    const r = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email }),
    });

    if (r.ok) {
      res.status(200).json({ ok: true });
      return;
    }

    // Already subscribed is a success from the reader's point of view.
    const text = await r.text();
    if (r.status === 400 && /already|exists|subscrib/i.test(text)) {
      res.status(200).json({ ok: true, already: true });
      return;
    }
    res.status(502).json({ error: 'Subscribe failed' });
  } catch {
    res.status(502).json({ error: 'Subscribe failed' });
  }
}
