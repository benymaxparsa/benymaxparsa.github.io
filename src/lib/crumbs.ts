// Breadcrumb trails: Home › Section. The section is a listing page, named as it is in the nav.
import { nav, type Lang } from '../i18n';
import { pagePairs } from './urls';

export interface Crumb { url: string; title: string }

/** The listing page `enUrl` (an English URL such as /projects/) as a crumb in `lang`. */
export function sectionCrumb(enUrl: string, lang: Lang): Crumb | undefined {
  const url = lang === 'fr' ? pagePairs[enUrl] : enUrl;
  const item = url && nav[lang].find((n) => n.url === url);
  return item ? { url, title: item.title } : undefined;
}
