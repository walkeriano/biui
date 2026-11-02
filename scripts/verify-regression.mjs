// Full local-browser regression with disposable Supabase fixtures; never edits existing accounts.
// Requires --allow-test-writes. Does not apply SQL migrations or send emails.
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

if (!process.argv.includes('--allow-test-writes')) throw new Error('Requires --allow-test-writes for disposable fixtures.');
const base = process.env.BIUI_TEST_URL || 'http://127.0.0.1:3100';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Use a local app server.');
const runId = randomUUID().slice(0, 8);
const artifactDir = `/private/tmp/biui-regression-${runId}`;
await mkdir(artifactDir, { recursive: true });
const results = [], users = [], browserErrors = [];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) } };
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const anon = createClient(url, key, options);
let browser, owner, visitor, pageRow, firstBooking, ready;
const unwrap = (result) => { if (result.error) throw new Error(result.error.message); return result.data; };
function cleanError(error) {
  let message = String(error?.message || error).split('\n')[0];
  for (const user of users) message = message.replaceAll(user.password, '[redacted]');
  return message.replace(/(token_hash|code|access_token|refresh_token)=[^&\s]+/g, '$1=[redacted]');
}
function record(name, status, detail) {
  const result = { name, status, ...(detail ? { detail } : {}) };
  results.push(result); console.log(JSON.stringify(result));
}
async function check(name, fn, required = false) {
  try { const detail = await fn(); record(name, 'passed', detail); return true; }
  catch (error) {
    record(name, 'failed', cleanError(error));
    if (owner) await owner.screenshot({ path: `${artifactDir}/failure-${results.length}.png`, fullPage: true }).catch(() => {});
    if (required) throw error;
    return false;
  }
}
async function expectVisible(locator) { await locator.waitFor({ state: 'visible', timeout: 20000 }); }
async function waitUntil(fn) {
  for (let i = 0; i < 40; i += 1) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Condition did not become true');
}
async function section(name) {
  const button = owner.getByRole('button', { name });
  if (await button.getAttribute('aria-expanded') !== 'true') await button.click();
}
async function view(name) {
  const toggle = owner.getByRole('button', { name: 'Abrir menu', exact: true });
  if (await toggle.isVisible()) await toggle.click();
  await owner.getByRole('button', { name }).click();
  if (owner.viewportSize().width < 1024) {
    await owner.waitForFunction(() => document.querySelector('aside').getBoundingClientRect().right <= 1);
    assert.equal(await owner.getByRole('button', { name: 'Abrir menu', exact: true }).isVisible(), true);
  }
}
async function publish() {
  await owner.getByRole('button', { name: 'Publicar cambios', exact: true }).click();
  await expectVisible(owner.getByRole('heading', { name: 'Pagina publicada', exact: true }));
  pageRow = unwrap(await users[0].client.from('professional_pages').select('*').eq('user_id', users[0].id).single());
  await owner.getByRole('button', { name: 'Cerrar', exact: true }).click();
}
async function chooseDate(page) {
  await page.getByRole('button', { name: 'Mes siguiente', exact: true }).click();
  for (const button of await page.getByRole('button', { name: /^\d{1,2}$/ }).all()) {
    if (await button.isVisible() && await button.isEnabled()) { await button.click(); return; }
  }
  throw new Error('No available calendar day');
}
async function removeAssets(prefix) {
  const entries = unwrap(await admin.storage.from('profesional-assets').list(prefix, { limit: 1000 }));
  for (const entry of entries) {
    const path = `${prefix}/${entry.name}`;
    if (entry.id) unwrap(await admin.storage.from('profesional-assets').remove([path]));
    else await removeAssets(path);
  }
}
function captureErrors(page) { page.on('pageerror', (error) => browserErrors.push(cleanError(error))); }

try {
  const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || '/private/tmp/biui-verification/node_modules/playwright-core/index.mjs').href);
  browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const ownerContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/New_York' });
  owner = await ownerContext.newPage(); owner.setDefaultTimeout(20000); captureErrors(owner);
  const visitorContext = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'America/New_York' });
  visitor = await visitorContext.newPage(); visitor.setDefaultTimeout(20000); captureErrors(visitor);

  await check('Anonymous dashboard access remains protected', async () => {
    await owner.goto(`${base}/dashboard`);
    await owner.waitForURL('**/acceso**');
    await expectVisible(owner.getByRole('heading', { name: 'Crea tu cuenta', exact: true }));
  }, true);
  await check('Registration validates mandatory fields and password length without sending emails', async () => {
    await owner.getByRole('button', { name: 'Crear cuenta', exact: true }).last().click();
    assert.equal(await owner.locator('input[name=name]').evaluate((node) => node.validity.valueMissing), true);
    await owner.getByLabel('Nombre', { exact: true }).fill('Prueba registro');
    await owner.getByLabel('Email', { exact: true }).fill('regression@example.com');
    await owner.getByLabel('Contrasena', { exact: true }).fill('12345');
    assert.equal(await owner.locator('input[name=password]').evaluate((node) => node.checkValidity()), false);
    await owner.getByRole('button', { name: 'Ver contrasena' }).click();
    assert.equal(await owner.locator('input[name=password]').getAttribute('type'), 'text');
    await owner.getByRole('button', { name: 'Ocultar contrasena' }).click();
  });
  await check('Create two disposable accounts with real backend authentication and no email', async () => {
    for (let index = 0; index < 2; index += 1) {
      const email = `biui-regression-${runId}-${index}@example.com`;
      const password = `${randomUUID()}aA9!`;
      const { user } = unwrap(await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `BIUI QA ${runId}` } }));
      users.push({ id: user.id, email, password, client: createClient(url, key, options) });
      await writeFile(`${artifactDir}/fixtures.json`, JSON.stringify({ ids: users.map((entry) => entry.id) }), { mode: 0o600 });
      unwrap(await users[index].client.auth.signInWithPassword({ email, password }));
    }
  }, true);
  await check('Live backend migration status', async () => {
    const intervalSchema = await admin.from('appointments').select('id,duration_minutes,appointment_end_at').limit(0);
    ready = !intervalSchema.error;
    if (intervalSchema.error && !['42703', 'PGRST204'].includes(intervalSchema.error.code)) throw intervalSchema.error;
    return { intervalProtectionReady: ready };
  });
  if (!ready) record('Full interval protection and live rescheduling', 'blocked', 'The operator has not applied appointment-intervals.sql; existing booking compatibility is tested below.');
  const bucket = unwrap(await admin.storage.getBucket('profesional-assets'));
  if (bucket.file_size_limit !== 5242880 || !bucket.allowed_mime_types || bucket.allowed_mime_types.includes('image/svg+xml')) {
    record('Live Storage hardening', 'blocked', 'production-hardening.sql remains pending; no remote configuration was changed.');
  }
  await check('Draft pages and another owner stay isolated', async () => {
    const draft = unwrap(await users[1].client.from('professional_pages').insert({ user_id: users[1].id, slug: `qa-draft-${runId}`, published: false }).select('id').single());
    assert.deepEqual(unwrap(await anon.from('professional_pages').select('id').eq('id', draft.id)), []);
    assert.deepEqual(unwrap(await users[0].client.from('professional_pages').select('id').eq('id', draft.id)), []);
  });
  await check('Login handles invalid credentials and then opens the real dashboard', async () => {
    await owner.goto(`${base}/acceso?mode=login`);
    await owner.getByLabel('Email', { exact: true }).fill(users[0].email);
    await owner.getByLabel('Contrasena', { exact: true }).fill('incorrect-password');
    await owner.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expectVisible(owner.getByText('Invalid login credentials', { exact: true }));
    await owner.getByLabel('Contrasena', { exact: true }).fill(users[0].password);
    await owner.getByRole('button', { name: 'Entrar', exact: true }).click();
    await owner.waitForURL('**/dashboard');
    await expectVisible(owner.getByRole('heading', { name: 'Resumen del dia', exact: true }));
  }, true);

  let imageBuffer;
  await view(/Mi pagina/);
  await section(/^Portada \(Hero\)/);
  await check('Hero fields and local image preview update the page preview', async () => {
    await owner.getByLabel(/Titulo principal/).fill(`QA página ${runId}`);
    await owner.getByLabel(/Texto de presentacion/).fill('Texto de prueba temporal del recorrido completo.');
    // Generate a test image inside this isolated QA page, without external assets.
    imageBuffer = Buffer.from(await owner.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = 2100; canvas.height = 1200;
      const context = canvas.getContext('2d');
      const gradient = context.createLinearGradient(0, 0, 2100, 1200); gradient.addColorStop(0, '#003d2e'); gradient.addColorStop(1, '#78c442');
      context.fillStyle = gradient; context.fillRect(0, 0, 2100, 1200);
      context.fillStyle = '#fff'; context.font = 'bold 90px sans-serif'; context.fillText('BIUI QA', 160, 400);
      return canvas.toDataURL('image/png').split(',')[1];
    }), 'base64');
    await owner.locator('input[type=file]').first().setInputFiles({ name: 'qa.png', mimeType: 'image/png', buffer: imageBuffer });
    const frame = owner.frameLocator('iframe[title="Vista previa de pagina publica"]');
    await expectVisible(frame.getByRole('heading', { name: `QA página ${runId}`, exact: true }));
    await expectVisible(frame.getByText(`BIUI QA ${runId}`, { exact: true }).first());
    assert.ok(await owner.locator('img[src^="blob:"]').count() > 0);
  }, true);
  await check('Unsaved text and image survive navigation between dashboard sections', async () => {
    await view(/^Reservas/);
    await expectVisible(owner.getByRole('heading', { name: 'Proximas reservas', exact: true }));
    await view(/^Inicio/);
    await view(/Mi pagina/);
    assert.equal(await owner.getByLabel(/Titulo principal/).inputValue(), `QA página ${runId}`);
    assert.ok(await owner.locator('img[src^="blob:"]').count() > 0);
  });
  await check('Dismiss sign-out warning keeps the editor and its unsaved changes', async () => {
    const dialogue = owner.waitForEvent('dialog').then(async (warning) => { assert.match(warning.message(), /sin publicar/); await warning.dismiss(); });
    await Promise.all([dialogue, owner.getByRole('button', { name: /Cerrar sesión/ }).click()]);
    assert.ok(owner.url().endsWith('/dashboard'));
    assert.equal(await owner.getByLabel(/Titulo principal/).inputValue(), `QA página ${runId}`);
  });
  await check('Dismiss reload warning keeps unsaved editor changes', async () => {
    const dialog = owner.waitForEvent('dialog').then(async (warning) => {
      assert.equal(warning.type(), 'beforeunload');
      await warning.dismiss();
    });
    const reload = owner.reload({ timeout: 5000 }).catch((error) => {
      if (!/ERR_ABORTED|Navigation.*aborted|Timeout/.test(error.message)) throw error;
    });
    await Promise.all([dialog, reload]);
    assert.equal(await owner.getByLabel(/Titulo principal/).inputValue(), `QA página ${runId}`);
  });
  await check('Appearance, about, service and contact sections can be edited', async () => {
    await section(/^Apariencia/);
    await owner.getByLabel('Codigo hexadecimal de color principal').fill('#245644');
    await owner.getByLabel('Tipografia de titulos').selectOption('Georgia');
    await owner.getByRole('button', { name: 'Cuadrado', exact: true }).click();
    await section(/^Sobre mi/);
    await owner.getByLabel('Subtitulo', { exact: false }).fill('Profesional de prueba');
    await section(/^Servicios/);
    await owner.getByLabel('Nombre del servicio', { exact: true }).fill('Consulta QA');
    await owner.getByLabel(/^Duracion/).selectOption('50 minutos');
    await owner.getByLabel('Precio', { exact: true }).fill('25');
    await owner.getByRole('button', { name: 'Anadir servicio', exact: true }).click();
    await owner.getByLabel('Nombre del servicio', { exact: true }).last().fill('Sesión larga QA');
    await owner.getByLabel(/^Duracion/).last().selectOption('90 minutos');
    await section(/^Ubicacion/);
    await owner.getByLabel('Ciudad', { exact: true }).fill('Madrid');
    await owner.getByLabel('Facebook', { exact: true }).fill('https://facebook.com/biui-qa');
    await owner.getByLabel(/^Link publico/).fill(`qa-regression-${runId}`);
    await section(/^Disponibilidad/);
    await owner.getByLabel('Desde', { exact: true }).fill('09:00');
    await owner.getByLabel('Hasta', { exact: true }).fill('19:00');
  }, true);
  await check('Preview switches between mobile and desktop without losing edits', async () => {
    await owner.getByRole('button', { name: 'Movil', exact: true }).click();
    await expectVisible(owner.frameLocator('iframe[title="Vista previa de pagina publica"]').getByRole('heading', { name: `QA página ${runId}`, exact: true }));
    assert.equal(await owner.locator('iframe').getAttribute('style').then((style) => style.includes('390px')), true);
    await owner.getByRole('button', { name: 'Escritorio', exact: true }).click();
  });
  await check('Publish persists text, services, appearance and compressed image in real Supabase', async () => {
    await publish();
    assert.equal(pageRow.services.length, 2);
    assert.equal(pageRow.services[1].durationMinutes, 90);
    assert.equal(pageRow.theme.primaryColor, '#245644');
    assert.equal(pageRow.theme.buttonStyle, 'square');
    assert.equal(pageRow.contact.city, 'Madrid');
    assert.equal(pageRow.published, true);
    assert.ok(pageRow.hero.image.startsWith(`${url}/storage/v1/object/public/profesional-assets/${users[0].id}/`));
    const image = await fetch(pageRow.hero.image); assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/webp');
    assert.ok((await image.arrayBuffer()).byteLength <= 700 * 1024);
  }, true);
  await check('Published public page renders content, image and contact links on mobile', async () => {
    await visitor.goto(`${base}/${pageRow.slug}`);
    await expectVisible(visitor.getByRole('heading', { name: `QA página ${runId}`, exact: true }));
    await expectVisible(visitor.getByRole('button', { name: /Consulta QA/ }));
    assert.equal(await visitor.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.ok(await visitor.locator('a[href*="facebook.com/biui-qa"]').count() > 0);
    await visitor.screenshot({ path: `${artifactDir}/public-mobile.png`, fullPage: true });
    await owner.screenshot({ path: `${artifactDir}/editor-desktop.png`, fullPage: true });
  }, true);
  await check('Availability failures block slots and the visitor can go back and retry', async () => {
    await visitor.route('**/api/appointments?**', (route) => route.fulfill({ status: 503, json: { error: 'Red de prueba no disponible' } }));
    await visitor.getByRole('button', { name: /Consulta QA/ }).click();
    await chooseDate(visitor);
    await expectVisible(visitor.getByText('Red de prueba no disponible', { exact: true }));
    assert.equal(await visitor.getByRole('button', { name: '09:00', exact: true }).isDisabled(), true);
    await visitor.unroute('**/api/appointments?**');
    await visitor.getByRole('button', { name: 'Volver al paso anterior', exact: true }).click();
    for (const button of await visitor.getByRole('button', { name: /^\d{1,2}$/ }).all()) {
      if (await button.isVisible() && await button.isEnabled()) { await button.click(); break; }
    }
    await waitUntil(async () => await visitor.getByRole('button', { name: '09:00', exact: true }).isEnabled());
  }, true);
  await check('Booking handles a submit network error and allows a successful retry', async () => {
    await visitor.getByRole('button', { name: '09:00', exact: true }).click();
    await visitor.getByLabel('Nombre completo', { exact: true }).fill('Cliente QA Temporal');
    await visitor.getByLabel('Telefono', { exact: true }).fill('600000000');
    await visitor.route('**/api/appointments', (route) => route.abort());
    await visitor.getByRole('button', { name: 'Reservar cita ahora', exact: true }).click();
    await expectVisible(visitor.getByText(/Failed to fetch|No se pudo conectar/));
    await visitor.unroute('**/api/appointments');
    const response = visitor.waitForResponse((response) => response.url().endsWith('/api/appointments') && response.request().method() === 'POST');
    await visitor.getByRole('button', { name: 'Reservar cita ahora', exact: true }).click();
    assert.equal((await response).status(), 201);
    await expectVisible(visitor.getByText('Cita reservada', { exact: true }));
    firstBooking = unwrap(await users[0].client.from('appointments').select('*').eq('professional_page_id', pageRow.id).single());
    assert.equal(firstBooking.status, 'pendiente');
    assert.equal(firstBooking.customer_name, 'Cliente QA Temporal');
  }, true);
  await check('Bookings and professional-page writes stay isolated from another owner', async () => {
    assert.deepEqual(unwrap(await anon.from('appointments').select('id').eq('id', firstBooking.id)), []);
    assert.deepEqual(unwrap(await users[1].client.from('appointments').select('id').eq('id', firstBooking.id)), []);
    assert.deepEqual(unwrap(await users[1].client.from('professional_pages').update({ slug: `forbidden-${runId}` }).eq('id', pageRow.id).select('id')), []);
  });
  await check('Reservation appears in dashboard and can be confirmed through the UI', async () => {
    await view(/^Reservas/);
    await expectVisible(owner.getByText('Cliente QA Temporal', { exact: true }));
    await owner.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expectVisible(owner.getByText('Reserva confirmada.', { exact: true }));
    const row = unwrap(await users[0].client.from('appointments').select('status').eq('id', firstBooking.id).single());
    assert.equal(row.status, 'confirmada');
  }, true);
  await check('Reschedule form loads services and validates changes without losing the booking', async () => {
    await owner.getByRole('button', { name: 'Reprogramar', exact: true }).click();
    const form = owner.getByRole('form', { name: /Reprogramar cita/ });
    await expectVisible(form.getByLabel(/^Hora/));
    await form.getByLabel(/^Hora/).selectOption('12:00');
    const response = owner.waitForResponse((response) => response.url().endsWith('/api/appointments') && response.request().method() === 'PATCH');
    await form.getByRole('button', { name: 'Guardar nueva fecha', exact: true }).click();
    assert.equal((await response).status(), ready ? 200 : 503);
    if (ready) await expectVisible(owner.getByText('Reserva reprogramada.', { exact: true }));
    else {
      await expectVisible(owner.getByText(/La reprogramación estará disponible/));
      const row = unwrap(await users[0].client.from('appointments').select('appointment_at,status').eq('id', firstBooking.id).single());
      assert.equal(row.appointment_at, firstBooking.appointment_at);
      assert.equal(row.status, 'confirmada');
      await form.getByRole('button', { name: 'Volver', exact: true }).click();
    }
  });
  await check('Cancel dialogue can be dismissed, then cancellation frees the booked slot', async () => {
    let dialog = owner.waitForEvent('dialog').then((warning) => warning.dismiss());
    await Promise.all([dialog, owner.getByRole('button', { name: 'Cancelar cita', exact: true }).click()]);
    assert.equal(unwrap(await users[0].client.from('appointments').select('status').eq('id', firstBooking.id).single()).status, 'confirmada');
    dialog = owner.waitForEvent('dialog').then((warning) => warning.accept());
    await Promise.all([dialog, owner.getByRole('button', { name: 'Cancelar cita', exact: true }).click()]);
    await expectVisible(owner.getByText('Reserva cancelada. El horario está libre.', { exact: true }));
    assert.equal(unwrap(await users[0].client.from('appointments').select('status').eq('id', firstBooking.id).single()).status, 'cancelada');
    await expectVisible(owner.getByText('Todavia no hay reservas', { exact: true }));
  }, true);
  await check('Public availability returns no personal data and cancellation frees 09:00', async () => {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(firstBooking.appointment_at));
    const response = await fetch(`${base}/api/appointments?${new URLSearchParams({ slug: pageRow.slug, date })}`);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.intervalProtectionReady, ready);
    assert.equal(JSON.stringify(result).includes('Cliente QA'), false);
    assert.deepEqual(result.bookedAppointmentAts, []);
  });
  await check('Two simultaneous real bookings still yield one creation and one conflict', async () => {
    const body = { slug: pageRow.slug, serviceName: 'Consulta QA', selectedTime: '10:00', appointmentAt: new Date(Date.parse(firstBooking.appointment_at) + 3600000).toISOString(), customerName: 'Cliente Concurrente QA', customerPhone: '600000001' };
    const responses = await Promise.all([1, 2].map(() => fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })));
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
  });
  await check('Migrated calendar UI blocks full durations and invalid late starts (simulated availability)', async () => {
    await visitor.goto(`${base}/${pageRow.slug}`);
    await visitor.route('**/api/appointments?**', async (route) => {
      const date = new URL(route.request().url()).searchParams.get('date');
      const { appointmentIso } = await import('../src/lib/booking.js');
      const start = appointmentIso(date, '09:00');
      await route.fulfill({ json: { intervalProtectionReady: true, bookedAppointmentAts: [start], bookedIntervals: [{ appointment_at: start, appointment_end_at: new Date(Date.parse(start) + 90 * 60000).toISOString() }] } });
    });
    await visitor.getByRole('button', { name: /Sesión larga QA/ }).click();
    await chooseDate(visitor);
    await expectVisible(visitor.getByRole('button', { name: /10:00.*Ocupado/ }));
    assert.equal(await visitor.getByRole('button', { name: /10:00.*Ocupado/ }).isDisabled(), true);
    assert.equal(await visitor.getByRole('button', { name: '11:00', exact: true }).isEnabled(), true);
    assert.equal(await visitor.getByRole('button', { name: '18:00', exact: true }).isDisabled(), true);
    await visitor.unroute('**/api/appointments?**');
  });
  await check('Republishing updates the public URL, content and dashboard link', async () => {
    const oldSlug = pageRow.slug;
    await view(/Mi pagina/);
    await section(/^Portada \(Hero\)/);
    await owner.getByLabel(/Titulo principal/).fill(`QA actualizada ${runId}`);
    await section(/^Ubicacion/);
    await owner.getByLabel(/^Link publico/).fill(`${oldSlug}-nueva`);
    await publish();
    assert.equal(await owner.getByRole('link', { name: /Ver pagina/ }).getAttribute('href'), `/${pageRow.slug}`);
    await visitor.goto(`${base}/${pageRow.slug}`);
    await expectVisible(visitor.getByRole('heading', { name: `QA actualizada ${runId}`, exact: true }));
    assert.equal((await fetch(`${base}/${oldSlug}`)).status, 404);
  }, true);
  await check('Reloaded editor hydrates the last saved page without losing published values', async () => {
    await owner.reload();
    await view(/Mi pagina/);
    await section(/^Portada \(Hero\)/);
    assert.equal(await owner.getByLabel(/Titulo principal/).inputValue(), `QA actualizada ${runId}`);
    await section(/^Servicios/);
    assert.equal(await owner.getByLabel('Nombre del servicio', { exact: true }).count(), 2);
  });
  await check('Mobile dashboard navigation remains usable and has no horizontal overflow', async () => {
    await owner.setViewportSize({ width: 390, height: 844 });
    await view(/^Reservas/);
    await expectVisible(owner.getByRole('heading', { name: 'Proximas reservas', exact: true }));
    assert.equal(await owner.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await view(/Mi pagina/);
    await section(/^Portada \(Hero\)/);
    await expectVisible(owner.getByLabel(/Titulo principal/));
    const savedTitle = await owner.getByLabel(/Titulo principal/).inputValue();
    await owner.getByLabel(/Titulo principal/).fill(`Edición móvil ${runId}`);
    await owner.getByLabel(/Titulo principal/).fill(savedTitle);
    assert.equal(await owner.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await owner.screenshot({ path: `${artifactDir}/editor-mobile.png`, fullPage: true });
    await owner.setViewportSize({ width: 1440, height: 1000 });
  });
  await check('Real recovery token opens the password form and mismatches are rejected', async () => {
    const recoveryContext = await browser.newContext();
    const recovery = await recoveryContext.newPage(); captureErrors(recovery);
    const link = unwrap(await admin.auth.admin.generateLink({ type: 'recovery', email: users[0].email }));
    await recovery.goto(`${base}/auth/confirm?${new URLSearchParams({ token_hash: link.properties.hashed_token, type: 'recovery' })}`);
    try { await expectVisible(recovery.getByLabel('Nueva contraseña', { exact: true })); } catch {
      await recovery.screenshot({ path: `${artifactDir}/recovery-failure.png`, fullPage: true });
      throw new Error(`Recovery form unavailable at ${new URL(recovery.url()).origin}${new URL(recovery.url()).pathname}: ${(await recovery.locator('body').innerText()).slice(0, 300)}`);
    }
    await recovery.getByLabel('Nueva contraseña', { exact: true }).fill(`${randomUUID()}aA9!`);
    await recovery.getByLabel('Repite la contraseña', { exact: true }).fill('no-coincide-123!');
    await recovery.getByRole('button', { name: 'Guardar contraseña', exact: true }).click();
    await expectVisible(recovery.getByText('Las contraseñas no coinciden.', { exact: true }));
    const newPassword = `${randomUUID()}bB9!`;
    await recovery.getByLabel('Nueva contraseña', { exact: true }).fill(newPassword);
    await recovery.getByLabel('Repite la contraseña', { exact: true }).fill(newPassword);
    await recovery.getByRole('button', { name: 'Guardar contraseña', exact: true }).click();
    await expectVisible(recovery.getByText('Tu contraseña se ha actualizado.', { exact: true }));
    unwrap(await users[0].client.auth.signInWithPassword({ email: users[0].email, password: newPassword }));
    users[0].password = newPassword;
    await recoveryContext.close();
  });
  await check('Invalid recovery link provides a return to the login form', async () => {
    await visitor.goto(`${base}/auth/confirm?code=invalid-test-code`);
    await expectVisible(visitor.getByText(/El enlace no es válido o ha caducado/));
    await visitor.getByRole('link', { name: 'Volver al acceso', exact: true }).click();
    await expectVisible(visitor.getByRole('heading', { name: 'Inicia sesion', exact: true }));
  });
  await check('Real sign-out removes dashboard access', async () => {
    await owner.getByRole('button', { name: /Cerrar sesión/ }).click();
    await owner.waitForURL('**/acceso');
    await owner.goto(`${base}/dashboard`);
    await owner.waitForURL('**/acceso**');
  });
  await check('Withdrawing the disposable page removes public access and rejects new bookings', async () => {
    unwrap(await users[0].client.from('professional_pages').update({ published: false }).eq('id', pageRow.id));
    assert.equal((await fetch(`${base}/${pageRow.slug}`)).status, 404);
    assert.equal((await fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: pageRow.slug, serviceName: 'Consulta QA', selectedTime: '09:00', appointmentAt: '2030-01-07T08:00:00.000Z', customerName: 'Temporal', customerPhone: '600' }) })).status, 404);
  });
  await check('No uncaught JavaScript errors during the full browser workflow', async () => { assert.deepEqual(browserErrors, []); });
} catch (error) {
  if (!results.some((result) => result.status === 'failed')) record('Complete workflow prerequisites', 'failed', cleanError(error));
} finally {
  if (browser) await browser.close();
  for (const user of users) {
    await check('Remove this run’s temporary files, page, reservations and account', async () => {
      await removeAssets(user.id);
      unwrap(await admin.auth.admin.deleteUser(user.id));
      assert.deepEqual(unwrap(await admin.from('professional_pages').select('id').eq('user_id', user.id)), []);
      assert.deepEqual(unwrap(await admin.from('appointments').select('id').eq('professional_user_id', user.id)), []);
    });
  }
  const report = { checkedAt: new Date().toISOString(), runId, artifactDir, results };
  await writeFile('docs/regression-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ summary: results.reduce((acc, result) => ({ ...acc, [result.status]: (acc[result.status] || 0) + 1 }), {}), artifactDir }));
}
if (results.some((result) => result.status === 'failed')) process.exitCode = 1;
