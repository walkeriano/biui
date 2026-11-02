// Isolated PostgreSQL verification. No Supabase connection or real data is used.
// Install PGlite outside the repo, then pass PGLITE_MODULE=/absolute/path/dist/index.js.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const moduleUrl = process.env.PGLITE_MODULE ? pathToFileURL(process.env.PGLITE_MODULE).href : import.meta.resolve('@electric-sql/pglite');
const { PGlite } = await import(moduleUrl);
const { btree_gist } = await import(new URL('./contrib/btree_gist.js', moduleUrl));
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/appointment-intervals.sql', import.meta.url), 'utf8');
const preflight = await readFile(new URL('../supabase/appointment-intervals-preflight.sql', import.meta.url), 'utf8');
const hardening = await readFile(new URL('../supabase/production-hardening.sql', import.meta.url), 'utf8');
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const other = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const page = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const first = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const second = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
let checks = 0;
const passed = (message) => { checks += 1; console.log(`ok ${checks} - ${message}`); };

async function setup() {
  const db = new PGlite({ extensions: { btree_gist } });
  await db.exec(`
    create schema extensions; create schema auth; create schema storage;
    create role anon; create role authenticated; create role service_role bypassrls;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    create table storage.buckets(id text primary key, name text, public boolean, allowed_mime_types text[], file_size_limit bigint);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1, '/')$$;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant all on all tables in schema storage to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  `);
  return db;
}

const db = await setup();
try {
  // Start from the pre-interval schema, including historical data.
  await db.exec(schema.split('-- Duration snapshots and atomic protection')[0]);
  await db.query('insert into auth.users values ($1),($2)', [owner, other]);
  await db.query(`insert into professional_pages(id,user_id,slug,published,services) values ($1,$2,'test-owner',true,$3::jsonb)`, [page, owner, JSON.stringify([{ name: 'Consulta', duration: '90 minutos' }])]);
  await db.query(`insert into appointments(id,professional_user_id,professional_page_id,customer_name,customer_phone,service_name,appointment_at)
    values ($1,$3,$4,'Cliente A','600','Consulta','2030-01-07T08:00:00Z'),($2,$3,$4,'Cliente B','601','Consulta','2030-01-07T09:00:00Z')`, [first, second, owner, page]);
  const review = await db.query(preflight);
  assert.ok(review.rows.some((row) => row.conflicting_id === second));
  passed('Read-only preflight identifies historical overlaps');
  await assert.rejects(db.exec(migration), /Existing active appointments overlap/);
  await db.exec('rollback');
  assert.equal((await db.query(`select count(*)::int as total from information_schema.columns where table_name='appointments' and column_name='duration_minutes'`)).rows[0].total, 0);
  assert.equal((await db.query('select count(*)::int as total from appointments')).rows[0].total, 2);
  passed('Migration rolls back entirely when historical appointments overlap');
  await db.query(`update appointments set appointment_at='2030-01-07T10:00:00Z' where id=$1`, [second]);
  await db.exec(migration);
  const stored = (await db.query('select duration_minutes, appointment_end_at from appointments where id=$1', [first])).rows[0];
  assert.equal(stored.duration_minutes, 90);
  assert.equal(new Date(stored.appointment_end_at).toISOString(), '2030-01-07T09:30:00.000Z');
  passed('Existing labels backfill numeric duration and end correctly');
  const insert = (start, minutes = 50, professional = owner) => db.query(`insert into appointments(professional_user_id,professional_page_id,customer_name,customer_phone,service_name,appointment_at,duration_minutes)
    values ($1,$2,'Temporal','600','Consulta',$3,$4) returning id`, [professional, page, start, minutes]);
  await assert.rejects(insert('2030-01-07T09:00:00Z'), (error) => error.code === '23P01');
  passed('Different starts that overlap a 90-minute booking are rejected atomically');
  const adjacent = await insert('2030-01-07T09:30:00Z', 30);
  assert.ok(adjacent.rows[0].id);
  await insert('2030-01-07T08:00:00Z', 50, other);
  passed('Adjacent intervals and different professionals remain allowed');
  await assert.rejects(db.query(`update appointments set appointment_at='2030-01-07T09:00:00Z' where id=$1`, [second]), (error) => error.code === '23P01');
  passed('Reprogramming cannot move an existing appointment into another interval');
  await db.query(`update appointments set status='cancelada' where id=$1`, [first]);
  await insert('2030-01-07T08:00:00Z', 90);
  await assert.rejects(db.query(`update appointments set status='confirmada' where id=$1`, [first]), (error) => ['23P01', '23505'].includes(error.code));
  passed('Cancellation frees the full interval; reactivation still checks conflicts');
  await db.query(`update appointments set appointment_end_at='2030-01-07T08:01:00Z' where id=$1`, [second]);
  const end = (await db.query('select appointment_end_at from appointments where id=$1', [second])).rows[0].appointment_end_at;
  assert.equal(new Date(end).toISOString(), '2030-01-07T11:30:00.000Z');
  await assert.rejects(insert('2030-01-08T08:00:00Z', 0), (error) => error.code === '23514');
  passed('Database recomputes ends and rejects invalid duration');
  await db.exec(migration);
  passed('Interval migration can be rerun safely');
  // Reproduce the remote unsafe settings, then apply the prepared hardening.
  await db.exec(`grant insert on appointments to anon, authenticated;
    create policy "Customers can create appointments on published pages" on appointments for insert with check(true);
    alter table professional_pages alter column published set default true;
    update storage.buckets set allowed_mime_types=null,file_size_limit=null;`);
  await db.exec(hardening);
  const privileges = (await db.query(`select has_table_privilege('anon','public.appointments','insert') as anon_insert,
    has_table_privilege('authenticated','public.appointments','insert') as auth_insert`)).rows[0];
  assert.deepEqual(privileges, { anon_insert: false, auth_insert: false });
  const bucket = (await db.query(`select allowed_mime_types,file_size_limit from storage.buckets where id='profesional-assets'`)).rows[0];
  assert.equal(Number(bucket.file_size_limit), 5242880);
  assert.equal(bucket.allowed_mime_types.includes('image/svg+xml'), false);
  await db.exec('set role anon');
  assert.deepEqual((await db.query('select id from appointments')).rows, []);
  await assert.rejects(insert('2030-01-08T08:00:00Z'), (error) => error.code === '42501');
  await db.exec('reset role');
  passed('Hardening blocks direct anonymous inserts, keeps bookings private and restricts Storage');
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${other}',false)`);
  assert.deepEqual((await db.query('select id from appointments where professional_user_id=$1', [owner])).rows, []);
  assert.deepEqual((await db.query(`update appointments set status='cancelada' where id=$1 returning id`, [second])).rows, []);
  const draft = (await db.query(`insert into professional_pages(user_id,slug) values ($1,'test-other') returning published`, [other])).rows[0];
  assert.equal(draft.published, false);
  await db.exec('reset role');
  passed('RLS isolates owners and new pages default to private drafts');
} finally { await db.close(); }

const fresh = await setup();
try {
  await fresh.exec(schema);
  await fresh.exec(schema);
  assert.equal((await fresh.query(`select count(*)::int as total from pg_constraint where conname='appointments_no_overlap'`)).rows[0].total, 1);
  passed('Full schema bootstraps and reapplies with the interval constraint');
} finally { await fresh.close(); }
console.log(`${checks} isolated SQL checks passed.`);
