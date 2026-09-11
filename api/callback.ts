import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminOrigin, cookieOptions, prepareResponse, resultPage, stateCookie } from '../src/lib/admin-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  prepareResponse(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Please start sign-in from the editor.');
    return;
  }
  // Consume the state on every callback, including cancelled and failed attempts.
  res.setHeader('Set-Cookie', `${stateCookie}=; ${cookieOptions}; Max-Age=0`);

  let origin: string;
  try {
    origin = adminOrigin();
  } catch {
    res.status(503).send('The sign-in website address needs updating. Ask the site owner to check ADMIN_SITE_URL in Vercel.');
    return;
  }
  const fail = (status: number, message: string) => res.status(status).send(resultPage(origin, 'error', message));
  const { code, state, error } = req.query;
  const savedState = (req.headers.cookie ?? '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${stateCookie}=`))?.slice(stateCookie.length + 1);

  if (typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(state) || state !== savedState) {
    fail(400, 'This sign-in attempt expired or cookies were blocked. Close this window, allow cookies for the site, and choose Sign In with GitHub again.');
    return;
  }
  if (error) {
    fail(401, 'GitHub sign-in was cancelled or declined. Return to the editor and try again, then approve access on GitHub.');
    return;
  }
  if (typeof code !== 'string' || !code) {
    fail(400, 'GitHub did not complete sign-in. Return to the editor and choose Sign In with GitHub again.');
    return;
  }
  const clientId = process.env.GITHUB_OAUTH_ID?.trim();
  const clientSecret = process.env.GITHUB_OAUTH_SECRET?.trim();
  if (!clientId || !clientSecret) {
    fail(503, 'GitHub sign-in needs a one-time setup by the site owner. Follow the setup guide below.');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${origin}/api/callback` }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await tokenRes.json()) as { access_token?: unknown; error?: string };
    if (!tokenRes.ok || typeof data.access_token !== 'string' || !data.access_token) {
      fail(401, 'GitHub could not finish sign-in. Try again from the editor. If this keeps happening, ask the site owner to check the GitHub app settings using the setup guide.');
      return;
    }
    res.status(200).send(resultPage(origin, 'success', 'Return to your editor tab to start writing.', data.access_token));
  } catch {
    fail(502, 'We couldn’t reach GitHub to finish signing in. Please wait a moment, then try again from the editor.');
  }
}
