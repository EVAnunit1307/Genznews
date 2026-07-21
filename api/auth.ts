import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

// Shown when one-click login hasn't been switched on yet (OAuth env vars
// missing). Explains the exact fix, offers the token fallback, and — if this
// was opened as the CMS login popup — posts a clean error back so the CMS
// doesn't just spin on a raw 500.
function notConfiguredPage(origin: string) {
  const handshake =
    'authorization:github:error:' +
    JSON.stringify({ provider: 'github', error: 'GitHub OAuth is not configured yet' });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>One-click login isn't switched on yet</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #0a0a0a; color: #f4f4f5; padding: 24px;
    font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .card { width: 100%; max-width: 540px; background: #141414;
    border: 1px solid rgba(255,255,255,.1); border-radius: 18px; padding: 28px; }
  h1 { font-size: 19px; margin: 0 0 8px; letter-spacing: -.01em; }
  p { margin: 0 0 14px; color: rgba(244,244,245,.75); }
  ol { margin: 0 0 16px; padding-left: 20px; color: rgba(244,244,245,.88); }
  li { margin: 7px 0; }
  code { background: rgba(255,255,255,.08); padding: 1px 6px; border-radius: 6px;
    font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  .hint { font-size: 13px; color: rgba(244,244,245,.55);
    border-top: 1px solid rgba(255,255,255,.08); padding-top: 14px; }
  a { color: #f4f4f5; }
</style>
</head>
<body>
  <div class="card">
    <h1>One-click GitHub login isn&rsquo;t switched on yet</h1>
    <p>The sign-in relay is deployed and working &mdash; it just needs two values from a
       GitHub OAuth App. Add them once and this page becomes a one-tap login.</p>
    <ol>
      <li>GitHub &rarr; <strong>Settings &rarr; Developer settings &rarr; OAuth Apps &rarr; New OAuth App</strong>.</li>
      <li>Set <strong>Authorization callback URL</strong> to <code>${origin}/api/callback</code></li>
      <li>Copy the <strong>Client ID</strong>, then generate a <strong>client secret</strong>.</li>
      <li>In Vercel &rarr; <strong>Settings &rarr; Environment Variables</strong> (Production), add
          <code>GITHUB_OAUTH_ID</code> and <code>GITHUB_OAUTH_SECRET</code>, then <strong>redeploy</strong>.</li>
    </ol>
    <p class="hint">In a hurry? You can still sign in right now: open
       <a href="/admin">/admin</a> and choose <strong>Sign In Using Access Token</strong> with a
       fine-grained GitHub token (Contents: read/write).</p>
  </div>
  <script>
    try {
      if (window.opener) {
        var receive = function (e) {
          window.opener.postMessage('${handshake}', e.origin);
          window.removeEventListener('message', receive, false);
        };
        window.addEventListener('message', receive, false);
        window.opener.postMessage('authorizing:github', '*');
      }
    } catch (err) {}
  </script>
</body>
</html>`;
}

// Step 1 of the Decap/Sveltia GitHub OAuth flow: send the editor to GitHub.
export default function handler(req: VercelRequest, res: VercelResponse) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host ?? 'genznews.vercel.app';
  const origin = `${proto}://${host}`;

  const clientId = process.env.GITHUB_OAUTH_ID;
  if (!clientId) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(503).send(notConfiguredPage(origin));
    return;
  }

  const redirectUri = `${origin}/api/callback`;
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
