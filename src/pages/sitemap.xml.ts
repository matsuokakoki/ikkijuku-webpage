import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
export const GET: APIRoute = async ({ site }) => {
  const c = await getContent();
  const paths = [
    '/',
    '/about/',
    '/courses/',
    '/news/',
    '/achievements/',
    '/access/',
    '/contact/',
    '/calendar/',
    '/privacy/',
    ...c.news.map((n) => `/news/${n.id}/`),
    ...c.achievements.map((a) => `/achievements/${a.year}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${new URL(p, site)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
