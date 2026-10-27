import snapshot from '../data/snapshot.json';
import { contentSchema, type Content } from './schema';
import { normalizeMicrocms } from './normalize';
let pending: Promise<Content> | undefined;
async function load(): Promise<Content> {
  const source = import.meta.env.CONTENT_SOURCE || 'snapshot';
  if (source === 'snapshot') return contentSchema.parse(snapshot);
  if (source !== 'microcms') throw new Error('Unknown CONTENT_SOURCE');
  const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const key = import.meta.env.MICROCMS_API_KEY;
  if (!domain || !/^[a-z0-9-]+$/.test(domain) || !key)
    throw new Error('microCMS connection is incomplete');
  async function request(path: string) {
    const response = await fetch(`https://${domain}.microcms.io/api/v1/${path}`, {
      headers: { 'X-MICROCMS-API-KEY': key },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`microCMS ${path.split('?')[0]}: HTTP ${response.status}`);
    return response.json();
  }
  async function list(endpoint: string) {
    const all: unknown[] = [];
    let total = 0;
    do {
      const page = await request(`${endpoint}?limit=100&offset=${all.length}`);
      if (!Array.isArray(page.contents) || !Number.isInteger(page.totalCount))
        throw new Error(`Invalid CMS response: ${endpoint}`);
      total = page.totalCount;
      if (page.contents.length === 0 && all.length < total)
        throw new Error('Incomplete CMS pagination');
      all.push(...page.contents);
    } while (all.length < total);
    return all;
  }
  const [site, news, achievements, calendar] = await Promise.all([
    request('site'),
    list('news'),
    list('achievements'),
    list('calendar'),
  ]);
  return normalizeMicrocms(
    site,
    news as Record<string, any>[],
    achievements as Record<string, any>[],
    calendar as Record<string, any>[],
  );
}
export const getContent = () => (pending ??= load());
