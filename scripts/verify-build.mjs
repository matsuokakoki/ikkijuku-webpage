import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const files = await fs.readdir('dist', { recursive: true });
const html = files.filter((x) => x.endsWith('.html'));
let total = 0;
for (const name of html) {
  const body = await fs.readFile(path.join('dist', name), 'utf8');
  total += Buffer.byteLength(body);
  assert.match(body, /<html lang="ja"/);
  assert.equal((body.match(/<h1[ >]/g) || []).length, 1, `${name}: one h1 required`);
  assert.doesNotMatch(body, /firebasejs|X-MICROCMS-API-KEY|MICROCMS_API_KEY|\bAIza[\w-]+/);
  for (const script of body.matchAll(/<script\b[^>]*src="([^"]+)"/g)) {
    assert.ok(script[1].startsWith('/_astro/'), `${name}: unexpected external script`);
  }
  for (const m of body.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    const target = m[1];
    if (target.startsWith('//')) continue;
    const candidate = path.join('dist', target.endsWith('/') ? `${target}index.html` : target);
    assert.ok(files.includes(path.relative('dist', candidate)), `${name}: missing ${target}`);
  }
}
assert.ok(html.length >= 10);
assert.ok(total < 600000, 'Unexpectedly large HTML bundle');
console.log(
  `Verified ${html.length} HTML pages, ${Math.round(total / 1024)} KiB total, no browser SDK or API keys`,
);
