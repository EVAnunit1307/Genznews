import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { runInNewContext } from 'node:vm';
import auth from '../api/auth.ts';
import callback from '../api/callback.ts';
import { resultPage, stateCookie } from '../src/lib/admin-oauth.js';

const origin = 'https://genznews.vercel.app';
const state = 'a'.repeat(64);
const savedEnv = { ...process.env };
const savedFetch = globalThis.fetch;
function response() {
  return {
    statusCode: 200, headers: {}, body: '',
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
    writeHead(code, headers) { this.statusCode = code; Object.assign(this.headers, headers); },
    end() {},
  };
}
function request(query = { code: 'test-code', state }, cookie = `${stateCookie}=${state}`) {
  return { method: 'GET', query, headers: { cookie, host: 'attacker.example', 'x-forwarded-proto': 'http' } };
}
beforeEach(() => {
  process.env.GITHUB_OAUTH_ID = 'test-client';
  process.env.GITHUB_OAUTH_SECRET = 'test-secret';
  delete process.env.ADMIN_SITE_URL;
  globalThis.fetch = async () => { throw new Error('Unexpected fetch'); };
});
afterEach(() => {
  for (const name of ['GITHUB_OAUTH_ID', 'GITHUB_OAUTH_SECRET', 'ADMIN_SITE_URL']) {
    if (savedEnv[name] === undefined) delete process.env[name]; else process.env[name] = savedEnv[name];
  }
  globalThis.fetch = savedFetch;
});

test('sign-in uses the trusted callback and a unique secure state cookie', () => {
  const res = response();
  auth(request(), res);
  assert.equal(res.statusCode, 302);
  const url = new URL(res.headers.Location);
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.searchParams.get('redirect_uri'), `${origin}/api/callback`);
  assert.equal(url.searchParams.get('scope'), 'repo');
  assert.match(url.searchParams.get('state'), /^[a-f0-9]{64}$/);
  assert.ok(res.headers['Set-Cookie'].startsWith(`${stateCookie}=${url.searchParams.get('state')};`));
  assert.match(res.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=600/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  const other = response(); auth(request(), other);
  assert.notEqual(res.headers['Set-Cookie'], other.headers['Set-Cookie']);
});

test('both credentials are required before redirecting', () => {
  for (const key of ['GITHUB_OAUTH_ID', 'GITHUB_OAUTH_SECRET']) {
    const value = process.env[key]; delete process.env[key];
    const res = response(); auth(request(), res);
    assert.equal(res.statusCode, 503);
    assert.match(res.body, /setup guide/);
    assert.equal(res.headers.Location, undefined);
    process.env[key] = value;
  }
});

test('custom origin is used and invalid configured origins fail closed', async () => {
  process.env.ADMIN_SITE_URL = 'https://editor.example';
  const res = response(); auth(request(), res);
  assert.equal(new URL(res.headers.Location).searchParams.get('redirect_uri'), 'https://editor.example/api/callback');
  for (const invalid of ['http://example.com', 'https://example.com/path', 'https://user:pass@example.com', 'not a url']) {
    process.env.ADMIN_SITE_URL = invalid;
    for (const handler of [auth, callback]) {
      const bad = response(); await handler(request(), bad);
      assert.equal(bad.statusCode, 503);
    }
  }
});

test('rejects missing, mismatched, duplicate and prefixed state before exchanging a code', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error(); };
  for (const req of [request({ code: 'code' }), request({ code: 'code', state: 'b'.repeat(64) }), request({ code: 'code', state: [state, state] }), request(undefined, `fake_${stateCookie}=${state}`), request(undefined, '')]) {
    const res = response(); await callback(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
  assert.equal(calls, 0);
});

test('cancelled sign-in, missing code and missing configuration have readable errors', async () => {
  for (const [query, status, message] of [[{ state, error: 'access_denied' }, 401, /cancelled/], [{ state }, 400, /did not complete/], [{ state, code: ['a', 'b'] }, 400, /did not complete/]]) {
    const res = response(); await callback(request(query), res);
    assert.equal(res.statusCode, status); assert.match(res.body, message);
  }
  delete process.env.GITHUB_OAUTH_SECRET;
  const res = response(); await callback(request(), res);
  assert.equal(res.statusCode, 503);
});

test('successful exchange sends credentials server-side and returns a private popup response', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://github.com/login/oauth/access_token');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { client_id: 'test-client', client_secret: 'test-secret', code: 'test-code', redirect_uri: `${origin}/api/callback` });
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ access_token: 'test-access' }) };
  };
  const res = response(); await callback(request(), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /authorization:github:success/);
  assert.ok(!res.body.includes('test-secret'));
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(res.headers['Referrer-Policy'], 'no-referrer');
  assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
});

test('GitHub failures never return success or reflect upstream errors', async () => {
  for (const [ok, data] of [[false, { access_token: 'do-not-release' }], [true, { error: '</script>unsafe' }], [true, { access_token: 123 }]]) {
    globalThis.fetch = async () => ({ ok, json: async () => data });
    const res = response(); await callback(request(), res);
    assert.equal(res.statusCode, 401);
    assert.ok(!res.body.includes('unsafe') && !res.body.includes('do-not-release'));
  }
  for (const fetcher of [async () => { throw new Error('timeout'); }, async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } })]) {
    globalThis.fetch = fetcher;
    const res = response(); await callback(request(), res);
    assert.equal(res.statusCode, 502);
    assert.match(res.body, /try again/);
  }
});

test('popup releases its result only to the trusted opener after the CMS handshake', () => {
  const token = "test'</script><script>attack()</script>\u2028";
  const page = resultPage(origin, 'success', 'Return to the editor.', token);
  assert.equal((page.match(/<script>/g) ?? []).length, 1);
  const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];
  const messages = []; let listener; let removed = false;
  const opener = { postMessage(...args) { messages.push(args); } };
  const window = { opener, addEventListener(type, fn) { listener = fn; }, removeEventListener() { removed = true; } };
  runInNewContext(script, { window });
  assert.deepEqual(messages, [['authorizing:github', origin]]);
  listener({ source: opener, origin: 'https://attacker.example', data: 'authorizing:github' });
  listener({ source: {}, origin, data: 'authorizing:github' });
  listener({ source: opener, origin, data: 'unrelated-message' });
  assert.equal(messages.length, 1);
  listener({ source: opener, origin, data: 'authorizing:github' });
  assert.equal(messages.length, 2);
  assert.equal(messages[1][1], origin);
  assert.deepEqual(JSON.parse(messages[1][0].slice('authorization:github:success:'.length)), { provider: 'github', token });
  assert.ok(removed);
  assert.doesNotThrow(() => runInNewContext(script, { window: { opener: null } }));
});

test('only GET requests can start or complete sign-in', async () => {
  for (const handler of [auth, callback]) {
    const res = response(); await handler({ ...request(), method: 'POST' }, res);
    assert.equal(res.statusCode, 405); assert.equal(res.headers.Allow, 'GET');
  }
});
