import type { Lang } from '../i18n';

// The public URL of the page being rendered: /teaching/x, /projects/x/, /404.html
export const pagePath = (url: URL) => url.pathname.replace(/\/index(\.html)?$/, '/').replace(/^(?!.*\/404\.html$)(.*)\.html$/, '$1');

export const langFromPath = (path: string): Lang => (path === '/fr' || path.startsWith('/fr/') ? 'fr' : 'en');
