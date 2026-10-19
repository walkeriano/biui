import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readLocalCache, writeLocalCache, clearLocalCache, clearUserCache, getUserCacheKey } from '../src/lib/localCache.js';

const originalWindow = globalThis.window;
function storage() {
  const items = {};
  Object.defineProperties(items, {
    getItem: { value: (key) => items[key] ?? null },
    setItem: { value: (key, value) => { items[key] = value; } },
    removeItem: { value: (key) => { delete items[key]; } },
  });
  return items;
}
beforeEach(() => { globalThis.window = { localStorage: storage(), dispatchEvent() {} }; });
afterEach(() => { globalThis.window = originalWindow; });

test('Cache stores values, expires at the TTL boundary and removes expired data', () => {
  const now = Date.now;
  let time = 1000;
  Date.now = () => time;
  try {
    writeLocalCache('page', { slug: 'ana' }, 100);
    assert.deepEqual(readLocalCache('page'), { slug: 'ana' });
    time = 1100;
    assert.equal(readLocalCache('page'), null);
    assert.equal(window.localStorage.getItem('biui:page'), null);
  } finally { Date.now = now; }
});

test('User cache is isolated and sign-out clears only that user', () => {
  const a = { id: 'a' }, b = { id: 'b' };
  writeLocalCache(getUserCacheKey(a, 'page'), { private: 'a' }, 1000);
  writeLocalCache(getUserCacheKey(b, 'page'), { private: 'b' }, 1000);
  clearUserCache(a);
  assert.equal(readLocalCache(getUserCacheKey(a, 'page')), null);
  assert.deepEqual(readLocalCache(getUserCacheKey(b, 'page')), { private: 'b' });
  clearLocalCache(getUserCacheKey(b, 'page'));
  assert.equal(readLocalCache(getUserCacheKey(b, 'page')), null);
});

test('Corrupt, malformed and old-version cache entries cannot be reused', () => {
  for (const raw of ['{', 'null', JSON.stringify({ version: 0, expiresAt: Date.now() + 10000, value: 'old' }), JSON.stringify({ version: 1, value: 'no-expiry' })]) {
    window.localStorage.setItem('biui:page', raw);
    assert.equal(readLocalCache('page'), null);
  }
});

test('Blocked storage and full quota never break the application', () => {
  Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  assert.equal(readLocalCache('page'), null);
  assert.doesNotThrow(() => writeLocalCache('page', {}, 100));
  assert.doesNotThrow(() => clearUserCache({ id: 'a' }));
  Object.defineProperty(window, 'localStorage', { value: { setItem() { throw new Error('quota'); } } });
  assert.doesNotThrow(() => writeLocalCache('page', {}, 100));
});
