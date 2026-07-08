import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

// Step 1 of the Decap/Sveltia GitHub OAuth flow: send the editor to GitHub.
export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_OAUTH_ID;
  if (!clientId) {
    res.status(500).send('GitHub OAuth is not configured (set GITHUB_OAUTH_ID / GITHUB_OAUTH_SECRET).');
    return;
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host;
  const redirectUri = `${proto}://${host}/api/callback`;
  const state = crypto.randomBytes(16).toString('hex');

  // CSRF: remember the state in a short-lived, http-only cookie.
  res.setHeader(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'repo,user');
  url.searchParams.set('state', state);

  res.writeHead(302, { Location: url.toString() });
  res.end();
}
