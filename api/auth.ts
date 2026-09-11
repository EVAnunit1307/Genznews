import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { adminOrigin, cookieOptions, prepareResponse, resultPage, stateCookie } from '../src/lib/admin-oauth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  prepareResponse(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Please start sign-in from the editor.');
    return;
  }

  let origin: string;
  try {
    origin = adminOrigin();
  } catch {
    res.status(503).send('The sign-in website address needs updating. Ask the site owner to check ADMIN_SITE_URL in Vercel.');
    return;
  }

  const clientId = process.env.GITHUB_OAUTH_ID?.trim();
  if (!clientId || !process.env.GITHUB_OAUTH_SECRET?.trim()) {
    res.status(503).send(resultPage(origin, 'error', 'GitHub sign-in needs a one-time setup by the site owner. Follow the setup guide below, then come back and choose Sign In with GitHub.'));
    return;
  }

  const state = crypto.randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', `${stateCookie}=${state}; ${cookieOptions}; Max-Age=600`);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', `${origin}/api/callback`);
  // Repository access is needed to publish; account write access is not.
  url.searchParams.set('scope', 'repo');
  url.searchParams.set('state', state);
  res.writeHead(302, { Location: url.toString() });
  res.end();
}
