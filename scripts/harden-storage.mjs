// Inspect by default. Pass --apply to update only the existing bucket's limits.
// Usage: node --env-file=.env.local scripts/harden-storage.mjs [--apply]
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const bucketId = 'profesional-assets';
const fileSizeLimit = 5 * 1024 * 1024;
const allowedMimeTypes = ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'];
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply')) throw new Error('Only --apply is supported.');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and server-only service role key are required.');
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) },
});
function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
function snapshot(bucket) {
  return { id: bucket.id, name: bucket.name, public: bucket.public,
    fileSizeLimit: bucket.file_size_limit, allowedMimeTypes: bucket.allowed_mime_types };
}
const before = unwrap(await admin.storage.getBucket(bucketId));
// The SDK sends name=id on updates; refuse to rename an unexpected bucket.
assert.equal(before.name, bucketId, 'Unexpected bucket name; no changes made.');
console.log(JSON.stringify({ before: snapshot(before), proposed: { fileSizeLimit, allowedMimeTypes } }));
if (args.includes('--apply')) {
  const backupPath = join(tmpdir(), `biui-storage-before-${randomUUID()}.json`);
  await writeFile(backupPath, JSON.stringify(snapshot(before), null, 2), { mode: 0o600, flag: 'wx' });
  console.log(JSON.stringify({ backupPath }));
  unwrap(await admin.storage.updateBucket(bucketId, {
    public: before.public, fileSizeLimit, allowedMimeTypes,
  }));
  const after = unwrap(await admin.storage.getBucket(bucketId));
  assert.equal(after.public, before.public, 'Bucket visibility changed unexpectedly.');
  assert.equal(after.file_size_limit, fileSizeLimit);
  assert.deepEqual([...after.allowed_mime_types].sort(), [...allowedMimeTypes].sort());
  console.log(JSON.stringify({ applied: true, after: snapshot(after) }));
} else console.log(JSON.stringify({ applied: false, instruction: 'Pass --apply to update bucket limits.' }));
