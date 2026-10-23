// Single source for document URLs and EN/FR twins (routes, listings, language switcher, hreflang).
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export const COLLECTIONS = ['teaching', 'projects', 'publications', 'research', 'education', 'industry', 'extracurricular'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];
export type Doc = CollectionEntry<CollectionName>;

export const langOf = (doc: Doc): Lang => (doc.data.lang === 'fr-CA' ? 'fr' : 'en');

// Jekyll: the permalink front matter, else the collection default /:collection/:path/
export const urlOf = (doc: Doc) => doc.data.permalink ?? `/${doc.collection}/${doc.id}/`;

// Jekyll's collection order: date, then path. Listings show it reversed (newest first).
export async function docs(name: CollectionName, lang?: Lang): Promise<Doc[]> {
  const all = (await getCollection(name)) as Doc[];
  return all
    .filter((d) => !lang || langOf(d) === lang)
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime() || (a.id + '.md' < b.id + '.md' ? -1 : 1));
}

export async function allDocs(): Promise<Doc[]> {
  return (await Promise.all(COLLECTIONS.map((c) => docs(c)))).flat();
}

// Twin rule: X.md <-> X-fr.md in the same collection.
export async function twinOf(doc: Doc): Promise<Doc | undefined> {
  const id = langOf(doc) === 'fr' ? doc.id.replace(/-fr$/, '') : `${doc.id}-fr`;
  return (await getCollection(doc.collection)).find((d) => d.id === id) as Doc | undefined;
}

// Page pairs that aren't collection docs (was _data/language_urls.yml)
export const pagePairs: Record<string, string> = {
  '/': '/fr/',
  '/research/': '/fr/recherche/',
  '/publications/': '/fr/publications/',
  '/teaching/': '/fr/enseignement/',
  '/teaching/materials/': '/fr/enseignement/materiel/',
  '/education/': '/fr/formation/',
  '/cv/': '/fr/cv/',
  '/projects/': '/fr/projets/',
  '/selected_courses/': '/fr/cours/',
  '/honors_and_extra/': '/fr/distinctions/',
  '/biography/': '/fr/biographie/',
  '/extracurricular/': '/fr/activites/',
  '/gallery/': '/fr/galerie/',
  '/industry/': '/fr/experiences/',
  '/contact/': '/fr/contact/',
  '/news/': '/fr/nouvelles/',
  '/404.html': '/fr/404.html',
};

// The other-language URL of a page, falling back to the other home page.
export function pageTwin(path: string, lang: Lang): string {
  if (lang === 'en') return pagePairs[path] ?? '/fr/';
  return Object.keys(pagePairs).find((en) => pagePairs[en] === path) ?? '/';
}
