import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicPageMetadata, normalizeBusinessName } from '../src/lib/professionalPage/metadata.js';
import { databaseRowToPublicPage, editorStateToPagePayload, pagePayloadToEditorState } from '../src/lib/professionalPage/mapper.js';
import { defaultPageData } from '../src/lib/professionalPage/defaults.js';

test('A commercial name survives publishing and reloading and names only the browser tab', () => {
  const payload = editorStateToPagePayload({
    availableDays: ['Lun'],
    data: { ...defaultPageData, businessName: '  Clínica   Áurea  ', publicSlug: 'clinica-aurea', heroTitle: 'Bienvenido', heroText: 'Atención personalizada.' },
    professional: { name: 'Ana García', avatarInitials: 'AG' },
    services: [],
  });
  const page = databaseRowToPublicPage({ id: 'page', ...payload });
  assert.equal(payload.hero.businessName, 'Clínica Áurea');
  assert.equal(pagePayloadToEditorState(page).data.businessName, 'Clínica Áurea');
  assert.deepEqual(getPublicPageMetadata(page), { title: 'Clínica Áurea', description: 'Atención personalizada.' });
  assert.equal(page.professional.name, 'Ana García');
  assert.equal(page.hero.title, 'Bienvenido');
});

test('Existing pages and an intentionally cleared commercial name use the professional name', () => {
  const legacy = databaseRowToPublicPage({ professional: { name: 'Ana García' }, hero: { text: 'Descripción actual' } });
  assert.equal(pagePayloadToEditorState(legacy).data.businessName, '');
  assert.equal(getPublicPageMetadata(legacy).title, 'Ana García');
  for (const businessName of ['', '   ', null, 123, {}]) {
    assert.equal(getPublicPageMetadata({ ...legacy, hero: { ...legacy.hero, businessName } }).title, 'Ana García');
  }
  assert.equal(pagePayloadToEditorState(null).data.businessName, '');
});

test('Commercial names are bounded on serialization and database reads as well as in the editor', () => {
  const value = 'Á'.repeat(100);
  assert.equal(normalizeBusinessName(value).length, 80);
  const payload = editorStateToPagePayload({ availableDays: [], data: { ...defaultPageData, businessName: value }, services: [] });
  assert.equal(payload.hero.businessName.length, 80);
  assert.equal(databaseRowToPublicPage({ hero: { businessName: value } }).hero.businessName.length, 80);
  assert.equal(getPublicPageMetadata({ hero: { businessName: 'Marca\ncon\tespacios' } }).title, 'Marca con espacios');
});

test('Missing names and missing pages have safe, defined titles', () => {
  assert.equal(getPublicPageMetadata({}).title, 'Perfil profesional');
  assert.equal(getPublicPageMetadata({ professional: { name: {} } }).title, 'Perfil profesional');
  assert.deepEqual(getPublicPageMetadata(null), { title: 'Pagina no encontrada | BIUI' });
});
