// Manual integration check. Creates only temporary users/assets, then deletes them.
// Requires a running production build and an explicit --allow-test-writes flag.
import { createClient } from '@supabase/supabase-js';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

if (!process.argv.includes('--allow-test-writes')) throw new Error('Requires --allow-test-writes; temporary remote fixtures are created and removed.');
const base = process.env.BIUI_TEST_URL || 'http://127.0.0.1:3100';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Run against a local application server.');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const opts = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) } };
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, opts);
const anon = createClient(url, key, opts);
const runId = randomUUID().slice(0, 8);
const users = [], results = [];
let browser, pageRow, owner;
const record = (name, ok, detail) => { results.push({ name, ok, ...(detail ? { detail } : {}) }); console.log(JSON.stringify(results.at(-1))); };
async function check(name, operation) {
  try { const detail = await operation(); record(name, true, detail); return true; }
  catch (error) { record(name, false, error.message); return false; }
}
function unwrap(result) { if (result.error) throw new Error(result.error.message); return result.data; }
async function removeAssets(prefix) {
  const entries = unwrap(await admin.storage.from('profesional-assets').list(prefix, { limit: 100 }));
  for (const entry of entries) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id) unwrap(await admin.storage.from('profesional-assets').remove([path]));
    else await removeAssets(path);
  }
}
try {
  await check('Anonymous database connection and private appointments', async () => {
    unwrap(await anon.from('professional_pages').select('id').limit(1));
    assert.deepEqual(unwrap(await anon.from('appointments').select('id').limit(1)), []);
  });
  await check('Server database connection', async () => { unwrap(await admin.from('appointments').select('id').limit(1)); });
  await check('Storage bucket reachable (configuration snapshot)', async () => {
    const bucket = unwrap(await admin.storage.getBucket('profesional-assets'));
    assert.equal(bucket.public, true);
    return { limit: bucket.file_size_limit, allowedTypes: bucket.allowed_mime_types };
  });
  for (let index = 0; index < 2; index += 1) {
    const email = `biui-verification-${runId}-${index}@example.com`;
    const password = randomUUID() + 'aA9!';
    const { user } = unwrap(await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: 'BIUI Prueba Temporal' } }));
    users.push({ id: user.id, email, password, client: createClient(url, key, opts) });
    // Only ids are journaled, so interrupted checks can be cleaned up without secrets.
    await writeFile(`/private/tmp/biui-live-${runId}.json`, JSON.stringify({ ids: users.map((value) => value.id) }), { mode: 0o600 });
    unwrap(await users[index].client.auth.signInWithPassword({ email, password }));
  }
  record('Create and authenticate two temporary users without sending email', true);
  const draftSlug = `biui-verification-draft-${runId}`;
  const draft = unwrap(await users[1].client.from('professional_pages').insert({ user_id: users[1].id, slug: draftSlug }).select('id,published').single());
  await check('Database defaults new pages to private drafts', async () => { assert.equal(draft.published, false); });
  unwrap(await users[1].client.from('professional_pages').update({ published: false }).eq('id', draft.id));
  await check('Drafts are visible only to their owner', async () => {
    assert.equal(unwrap(await users[1].client.from('professional_pages').select('id').eq('id', draft.id)).length, 1);
    assert.deepEqual(unwrap(await users[0].client.from('professional_pages').select('id').eq('id', draft.id)), []);
    assert.deepEqual(unwrap(await anon.from('professional_pages').select('id').eq('id', draft.id)), []);
    assert.deepEqual(unwrap(await users[0].client.from('professional_pages').update({ slug: `forbidden-${runId}` }).eq('id', draft.id).select('id')), []);
  });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ1kAAAAASUVORK5CYII=', 'base64');
  await check('Storage rejects writing to another owner folder', async () => {
    const path = `${users[1].id}/verification/cross-owner.png`;
    const result = await users[0].client.storage.from('profesional-assets').upload(path, png, { contentType: 'image/png' });
    assert.ok(result.error, 'Storage accepted a cross-owner upload');
  });
  await check('Storage rejects SVG for new uploads', async () => {
    const result = await users[0].client.storage.from('profesional-assets').upload(`${users[0].id}/verification/vector.svg`, '<svg xmlns="http://www.w3.org/2000/svg"/>', { contentType: 'image/svg+xml' });
    assert.ok(result.error, 'Remote bucket still allows SVG');
  });

  const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || '/private/tmp/biui-verification/node_modules/playwright-core/index.mjs').href);
  browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const ownerContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/New_York' });
  owner = await ownerContext.newPage();
  owner.setDefaultTimeout(60000);
  const browserErrors = [];
  owner.on('pageerror', (error) => browserErrors.push(error.message));
  owner.on('requestfailed', (request) => console.log(JSON.stringify({ browserRequestFailed: new URL(request.url()).pathname, error: request.failure()?.errorText })));
  owner.on('response', (response) => {
    if (response.url().includes('/rest/v1/professional_pages') && response.request().method() === 'POST') console.log(JSON.stringify({ browserPageWriteStatus: response.status() }));
  });
  await owner.goto(`${base}/acceso`);
  const compressionSource = await readFile(new URL('../src/lib/imageCompression.js', import.meta.url), 'utf8');
  let imageBuffer;
  await check('Real browser compression: size, dimensions, alpha, invalid input and encoder fallback', async () => {
    const data = await owner.evaluate(async (source) => {
      const { compressImageFile, targetBytes, maxDimension } = await import(`data:text/javascript;base64,${btoa(source)}`);
      const canvas = document.createElement('canvas');
      canvas.width = 2560; canvas.height = 1600;
      const context = canvas.getContext('2d');
      const pixels = context.createImageData(canvas.width, canvas.height);
      let seed = 17;
      for (let i = 0; i < pixels.data.length; i += 4) {
        for (let c = 0; c < 3; c += 1) { seed = (seed * 1664525 + 1013904223) >>> 0; pixels.data[i + c] = seed >>> 24; }
        pixels.data[i + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
      const inputBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const input = new File([inputBlob], 'verification.png', { type: 'image/png' });
      const output = await compressImageFile(input);
      const bitmap = await createImageBitmap(output.file);
      const metrics = { ...output.stats, width: bitmap.width, height: bitmap.height, type: output.file.type };
      bitmap.close();
      if (output.file.size > targetBytes || metrics.width > maxDimension || metrics.height > maxDimension || output.file.size >= input.size) throw new Error('Compression limits were not met');
      for (const file of [new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' }), new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' }), new File(['broken'], 'bad.png', { type: 'image/png' })]) {
        let rejected = false; try { await compressImageFile(file); } catch { rejected = true; }
        if (!rejected) throw new Error('Invalid image was accepted');
      }
      canvas.width = 128; canvas.height = 64;
      context.fillStyle = '#f00'; context.fillRect(10, 10, 30, 30);
      const transparent = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const alphaOutput = await compressImageFile(new File([transparent], 'alpha.png', { type: 'image/png' }));
      const alphaBitmap = await createImageBitmap(alphaOutput.file);
      context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(alphaBitmap, 0, 0); alphaBitmap.close();
      if (context.getImageData(0, 0, 1, 1).data[3] !== 0) throw new Error('Transparency was lost');
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(callback) { return originalToBlob.call(this, callback, 'image/png'); };
      try {
        const fallback = await compressImageFile(input);
        if (fallback.file.type !== 'image/png' || !fallback.file.name.endsWith('.png') || fallback.file.size > targetBytes) throw new Error('Encoder fallback is mislabeled or too large');
      } finally { HTMLCanvasElement.prototype.toBlob = originalToBlob; }
      const bytes = new Uint8Array(await input.arrayBuffer());
      let binary = ''; for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
      return { metrics, fixture: btoa(binary) };
    }, compressionSource);
    imageBuffer = Buffer.from(data.fixture, 'base64');
    return data.metrics;
  });
  if (!imageBuffer) throw new Error('Compression fixture unavailable');

  await owner.getByRole('button', { name: 'Iniciar sesion', exact: true }).first().click();
  await owner.locator('input[name=email]').fill(users[0].email);
  await owner.locator('input[name=password]').fill(users[0].password);
  await owner.getByRole('button', { name: 'Entrar', exact: true }).click();
  await owner.waitForURL('**/dashboard');
  record('Browser login with Supabase session and dashboard proxy', true);
  await owner.getByRole('button', { name: /Mi pagina/ }).click();
  await owner.getByRole('button', { name: /Portada \(Hero\)/ }).click();
  await owner.getByLabel(/Titulo principal/).fill(`Pagina de prueba ${runId}`);
  await owner.getByLabel(/Texto de presentacion/).fill('Contenido temporal de verificación.');
  await owner.locator('input[type=file]').first().setInputFiles({ name: 'verification.png', mimeType: 'image/png', buffer: imageBuffer });
  await owner.getByRole('button', { name: /^Servicios/ }).click();
  await owner.getByLabel('Nombre del servicio', { exact: true }).fill('Consulta de prueba');
  await owner.getByLabel('Precio', { exact: true }).fill('25');
  await owner.getByRole('button', { name: /^Ubicacion/ }).click();
  const slug = `biui-verification-${runId}`;
  await owner.getByLabel(/Link publico/).fill(slug);
  await owner.getByRole('button', { name: 'Publicar cambios', exact: true }).click();
  await owner.getByRole('heading', { name: 'Pagina publicada', exact: true }).waitFor({ timeout: 60000 });
  pageRow = unwrap(await users[0].client.from('professional_pages').select('*').eq('user_id', users[0].id).single());
  assert.equal(pageRow.slug, slug);
  assert.equal(pageRow.professional.name, 'BIUI Prueba Temporal');
  await owner.frameLocator('iframe[title="Vista previa de pagina publica"]').getByText('BIUI Prueba Temporal', { exact: true }).first().waitFor();
  assert.ok(pageRow.hero.image.startsWith(`${url}/storage/v1/object/public/profesional-assets/${users[0].id}/`));
  const imageResponse = await fetch(pageRow.hero.image);
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
  assert.ok((await imageResponse.arrayBuffer()).byteLength <= 700 * 1024);
  record('Create and publish page from editor with compressed image uploaded to real Storage', true);
  await owner.getByRole('button', { name: 'Cerrar', exact: true }).click();

  const visitorContext = await browser.newContext({ timezoneId: 'America/New_York' });
  const visitor = await visitorContext.newPage();
  visitor.setDefaultTimeout(20000);
  await visitor.goto(`${base}/${slug}`);
  await visitor.getByRole('heading', { name: `Pagina de prueba ${runId}`, exact: true }).waitFor();
  await visitor.screenshot({ path: `/private/tmp/biui-public-${runId}.png`, fullPage: true });
  record('Published page renders publicly in another timezone', true);
  await visitor.getByRole('button', { name: /Consulta de prueba/ }).click();
  await visitor.getByRole('button', { name: 'Mes siguiente', exact: true }).click();
  await visitor.getByRole('button', { name: /^\d{1,2}$/ }).filter({ visible: true }).all().then(async (buttons) => { for (const button of buttons) { if (await button.isEnabled()) { await button.click(); return; } } throw new Error('No available day'); });
  await visitor.getByRole('button', { name: '09:00', exact: true }).click();
  await visitor.getByLabel('Nombre completo', { exact: true }).fill('Cliente Temporal');
  await visitor.getByLabel('Telefono', { exact: true }).fill('600000000');
  const bookingResponse = visitor.waitForResponse((response) => response.url().endsWith('/api/appointments') && response.request().method() === 'POST');
  await visitor.getByRole('button', { name: /Reservar cita ahora/ }).click();
  assert.equal((await bookingResponse).status(), 201);
  await visitor.getByText('Cita reservada', { exact: true }).waitFor();
  const appointments = unwrap(await users[0].client.from('appointments').select('id,appointment_at,status').eq('professional_page_id', pageRow.id));
  assert.equal(appointments.length, 1);
  assert.equal(appointments[0].status, 'pendiente');
  assert.deepEqual(unwrap(await users[1].client.from('appointments').select('id').eq('professional_page_id', pageRow.id)), []);
  assert.deepEqual(unwrap(await anon.from('appointments').select('id').eq('professional_page_id', pageRow.id)), []);
  record('Landing booking is created and visible only to its professional', true);

  await check('Direct anonymous inserts cannot bypass the booking API', async () => {
    const result = await anon.from('appointments').insert({ professional_user_id: users[0].id, professional_page_id: pageRow.id, customer_name: 'Cliente Temporal', customer_phone: '600000000', service_name: 'Consulta de prueba', appointment_at: new Date(Date.parse(appointments[0].appointment_at) + 7200000).toISOString() });
    assert.ok(result.error, 'Anonymous insert bypassed API');
  });
  const body = { slug, serviceName: 'Consulta de prueba', selectedTime: '10:00', appointmentAt: new Date(Date.parse(appointments[0].appointment_at) + 3600000).toISOString(), customerName: 'Carrera Temporal', customerPhone: '600000000' };
  await check('Two concurrent real reservations yield one success and one conflict', async () => {
    const responses = await Promise.all([1, 2].map(() => fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })));
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
  });
  await owner.getByRole('button', { name: /Reservas Agenda/ }).click();
  await owner.getByText('Cliente Temporal', { exact: true }).first().waitFor();
  record('Real reservation appears in dashboard', true);
  await owner.getByRole('button', { name: /Mi pagina/ }).click();
  await owner.getByRole('button', { name: /Portada \(Hero\)/ }).click();
  await owner.getByLabel(/Titulo principal/).fill(`Actualizada ${runId}`);
  await owner.getByRole('button', { name: /^Ubicacion/ }).click();
  const newSlug = `${slug}-nueva`;
  await owner.getByLabel(/Link publico/).fill(newSlug);
  await owner.getByRole('button', { name: 'Publicar cambios', exact: true }).click();
  await owner.getByRole('heading', { name: 'Pagina publicada', exact: true }).waitFor({ timeout: 60000 });
  assert.equal(await owner.getByRole('link', { name: /Ver pagina/ }).getAttribute('href'), `/${newSlug}`);
  await visitor.goto(`${base}/${newSlug}`);
  await visitor.getByRole('heading', { name: `Actualizada ${runId}`, exact: true }).waitFor();
  assert.equal((await fetch(`${base}/${slug}`)).status, 404);
  record('Republish refreshes public content, old slug and dashboard link without stale cache', true);
  await owner.getByRole('button', { name: 'Cerrar', exact: true }).click();
  const cached = await owner.evaluate((id) => JSON.parse(localStorage.getItem(`biui:user:${id}:professional-page`))?.value?.slug, users[0].id);
  assert.equal(cached, newSlug);
  record('Browser cache contains the last published version', true);
  await owner.getByRole('button', { name: /Cerrar sesión/ }).click();
  await owner.waitForURL('**/acceso');
  const cacheCleared = await owner.evaluate((id) => !Object.keys(localStorage).some((key) => key.startsWith(`biui:user:${id}:`)), users[0].id);
  assert.equal(cacheCleared, true);
  record('Sign-out clears the temporary user cache', true);
  await check('Unpublish removes public page immediately', async () => {
    unwrap(await users[0].client.from('professional_pages').update({ published: false }).eq('id', pageRow.id));
    assert.equal((await fetch(`${base}/${newSlug}`)).status, 404);
    assert.equal((await fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, slug: newSlug }) })).status, 404);
  });
  await check('No uncaught browser errors in editor', async () => { assert.deepEqual(browserErrors, []); });
} catch (error) {
  record('Integration workflow completed', false, error.message);
  if (owner) await owner.screenshot({ path: `/private/tmp/biui-failure-${runId}.png`, fullPage: true }).catch(() => {});
} finally {
  if (browser) await browser.close();
  for (const user of users) {
    await check('Cleanup temporary assets and user', async () => {
      await removeAssets(user.id);
      unwrap(await admin.auth.admin.deleteUser(user.id));
    });
  }
  await writeFile('docs/live-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), runId, results }, null, 2) + '\n');
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
