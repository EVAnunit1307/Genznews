import type { VercelRequest, VercelResponse } from '@vercel/node';

// Renders the tiny page Decap/Sveltia expects: it posts the token back to the
// CMS window that opened this popup, using the documented handshake.
function resultPage(status: 'success' | 'error', payload: Record<string, unknown>) {
  const content = JSON.stringify({ provider: 'github', ...payload });
  return `<!doctype html><html><body><script>
  (function () {
    function receiveMessage(e) {
      window.opener.postMessage('authorization:github:${status}:${content}', e.origin);
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
  </script></body></html>`;
}

// Step 2: exchange the code for a token and hand it to the CMS window.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = String(req.query.code ?? '');
  const state = String(req.query.state ?? '');

  const cookie = req.headers.cookie ?? '';
  const savedState = /oauth_state=([^;]+)/.exec(cookie)?.[1];

  res.setHeader('Content-Type', 'text/html');

  if (!code || !state || state !== savedState) {
    res.status(400).send(resultPage('error', { error: 'Invalid or missing state' }));
    return;
  }

  const clientId = process.env.GITHUB_OAUTH_ID;
  const clientSecret = process.env.GITHUB_OAUTH_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send(resultPage('error', { error: 'OAuth not configured' }));
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = (await tokenRes.json()) as { access_token?: string; error?: string };

    if (!data.access_token) {
      res.status(401).send(resultPage('error', { error: data.error ?? 'No access token' }));
      return;
    }

    // clear the state cookie
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    res.status(200).send(resultPage('success', { token: data.access_token }));
  } catch {
    res.status(502).send(resultPage('error', { error: 'Token exchange failed' }));
  }
}
