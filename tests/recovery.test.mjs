import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
let configured = true, error, calls, failure;
mock.module('../src/lib/supabase/config.js', { namedExports: { isSupabaseConfigured: configured } });
mock.module('../src/lib/supabase/server.js', { namedExports: { createClient: async () => {
  if (failure) throw new Error('Network unavailable');
  return { auth: {
    exchangeCodeForSession: async (code) => { calls.push(['code', code]); return { error }; },
    verifyOtp: async (payload) => { calls.push(['otp', payload]); return { error }; },
  } };
} } });
const { GET } = await import('../src/app/auth/confirm/route.js');
beforeEach(() => { error = null; calls = []; failure = false; });
const confirm = (query = '') => GET(new Request(`https://biui.test/auth/confirm${query}`));

test('Recovery exchanges the PKCE code and redirects only to the password form', async () => {
  const response = await confirm('?code=one-use-code&next=https://evil.test');
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), '/restablecer-contrasena');
  assert.deepEqual(calls, [['code', 'one-use-code']]);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
});

test('Optional token-hash recovery accepts only recovery tokens', async () => {
  await confirm('?token_hash=hash&type=recovery');
  assert.deepEqual(calls, [['otp', { token_hash: 'hash', type: 'recovery' }]]);
  calls = [];
  const response = await confirm('?token_hash=hash&type=signup');
  assert.match(response.headers.get('location'), /error=invalid_link/);
  assert.deepEqual(calls, []);
});

test('Expired, absent and failed recovery links return a recoverable error without tokens', async () => {
  error = { message: 'Token expired' };
  assert.match((await confirm('?code=expired')).headers.get('location'), /error=invalid_link/);
  assert.match((await confirm()).headers.get('location'), /error=invalid_link/);
  failure = true;
  assert.equal((await confirm('?code=secret')).headers.get('location'), '/restablecer-contrasena?error=invalid_link');
});

test('Recovery keeps the browser origin even when the server normalizes a loopback hostname', async () => {
  const response = await GET(new Request('http://localhost:3100/auth/confirm?code=valid', {
    headers: { host: '127.0.0.1:3100' },
  }));
  assert.equal(new URL(response.headers.get('location'), 'http://127.0.0.1:3100').origin, 'http://127.0.0.1:3100');
  assert.equal(response.headers.get('location'), '/restablecer-contrasena');
});
