// /sitemap.xml with the same URL forms as jekyll-sitemap (robots.txt and Search Console point here)
import type { APIRoute } from 'astro';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { allDocs, urlOf } from '../lib/urls';
import { nav } from '../i18n';
import { site } from '../lib/site';

const PAGES = ['/', '/fr/', ...nav.en.map((l) => l.url), ...nav.fr.map((l) => l.url),
  '/teaching/materials/', '/fr/enseignement/materiel/', '/gallery/', '/fr/galerie/', '/terms/', '/sitemap/'];

function pdfs(dir: string): string[] {
  return readdirSync(dir).flatMap((n: string) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? pdfs(p) : p.endsWith('.pdf') ? ['/' + relative('public', p)] : [];
  });
}

export const GET: APIRoute = async () => {
  const urls = [
    ...(await allDocs()).map((d) => ({ loc: urlOf(d), lastmod: d.data.date.toISOString().slice(0, 10) })),
    ...PAGES.map((loc) => ({ loc })),
    ...pdfs('public/files').sort().map((loc) => ({ loc })),
  ];
  const body = urls.map((u) => `<url>\n<loc>${site.url}${encodeURI(u.loc)}</loc>\n${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>\n` : ''}</url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml' },
  });
};
