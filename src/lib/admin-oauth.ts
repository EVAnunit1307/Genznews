import type { VercelResponse } from '@vercel/node';

// Keep this in sync with public/admin/config.yml when changing domains.
export function adminOrigin() {
  const url = new URL(process.env.ADMIN_SITE_URL || 'https://genznews.vercel.app');
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('ADMIN_SITE_URL must be an HTTPS origin');
  }
  return url.origin;
}

export const stateCookie = '__Host-admin_oauth_state';
export const cookieOptions = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export function prepareResponse(res: VercelResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
}

function html(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

// Serialize a JS string literal, including HTML parser and line separator escaping.
function scriptValue(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function resultPage(origin: string, status: 'success' | 'error', message: string, token?: string) {
  // The CMS may close the popup after receiving an error, so include help there too.
  const payload = status === 'success'
    ? { provider: 'github', token }
    : { provider: 'github', error: `${message} Help: ${origin}/admin/setup.html` };
  const response = `authorization:github:${status}:${JSON.stringify(payload)}`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>genzthinks · Sign in</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#0a0a0b;color:#f4f4f5;font:16px/1.6 system-ui,sans-serif}main{width:100%;max-width:480px;padding:28px;background:#141414;border:1px solid #333;border-radius:18px}h1{font-size:24px;line-height:1.3}p{color:#ccc}a{color:#fff}a.button{display:inline-block;padding:10px 16px;background:#f4f4f5;color:#141414;border-radius:8px;text-decoration:none;font-weight:600}small{display:block;margin-top:20px;color:#aaa}
</style></head><body><main>
<h1>${status === 'success' ? 'You’re signed in' : 'Let’s get you signed in'}</h1>
<p>${html(message)}</p>
<a class="button" href="${html(origin)}/admin/" target="_blank" rel="noopener">Open the editor</a>
<small>If you opened this from the editor, close this window and return to that tab.${status === 'error' ? ' For setup help, see the <a href="' + html(origin) + '/admin/setup.html" target="_blank" rel="noopener">sign-in setup guide</a>.' : ''}</small>
</main><script>
(function () {
  var origin = ${scriptValue(origin)};
  var opener = window.opener;
  if (!opener) return;
  function receiveMessage(event) {
    if (event.origin !== origin || event.source !== opener || event.data !== 'authorizing:github') return;
    opener.postMessage(${scriptValue(response)}, origin);
    window.removeEventListener('message', receiveMessage);
  }
  window.addEventListener('message', receiveMessage);
  opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;
}
