import fs from 'node:fs/promises';
const output = process.argv[2];
if (!output) throw Error('Usage: node --env-file=.env scripts/backup-content.mjs <backup.json>');
const domain = process.env.MICROCMS_SERVICE_DOMAIN,
  key = process.env.MICROCMS_API_KEY;
if (!domain || !/^[a-z0-9-]+$/.test(domain) || !key) throw Error('CMS credentials are required');
async function get(endpoint) {
  const r = await fetch(`https://${domain}.microcms.io/api/v1/${endpoint}`, {
    headers: { 'X-MICROCMS-API-KEY': key },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw Error(`Backup failed: ${endpoint.split('?')[0]} HTTP ${r.status}`);
  return r.json();
}
async function list(endpoint) {
  const contents = [];
  let total = 0;
  do {
    const page = await get(`${endpoint}?limit=100&offset=${contents.length}`);
    if (
      !Array.isArray(page.contents) ||
      !Number.isInteger(page.totalCount) ||
      (!page.contents.length && contents.length < page.totalCount)
    )
      throw Error('Incomplete backup');
    contents.push(...page.contents);
    total = page.totalCount;
  } while (contents.length < total);
  return contents;
}
const [site, news, achievements, calendar] = await Promise.all([
  get('site'),
  list('news'),
  list('achievements'),
  list('calendar'),
]);
await fs.writeFile(
  output,
  JSON.stringify(
    { exportedAt: new Date().toISOString(), site, news, achievements, calendar },
    null,
    2,
  ) + '\n',
  { flag: 'wx', mode: 0o600 },
);
console.log('Public CMS content backup saved; no credentials included.');
