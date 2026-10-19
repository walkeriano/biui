import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', shortCircuit: true };
  if (specifier.startsWith('@/')) {
    const base = fileURLToPath(new URL(`../src/${specifier.slice(2)}`, import.meta.url));
    const file = [base, `${base}.js`, `${base}.jsx`].find((value) => existsSync(value));
    if (!file) throw new Error(`Missing import: ${specifier}`);
    return nextResolve(pathToFileURL(file).href, context);
  }
  if (specifier === 'next/server') return nextResolve('next/server.js', context);
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.jsx') && url.includes('/src/')) {
    // Mapper tests import constants only; no JSX transformation is needed.
    return nextLoad(url, { ...context, format: 'module' });
  }
  return nextLoad(url, context);
}
