import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://benymaxparsa.github.io',
  // Mixed URL forms must survive: /teaching/x (served from x.html) and /projects/x/ (x/index.html)
  build: { format: 'preserve' },
  trailingSlash: 'ignore',
  // Jekyll redirect_from aliases that resolved to live pages
  redirects: {
    '/about': '/',
    '/about/index': '/',
    '/resume': '/cv/',
    '/fr/resume': '/fr/cv/',
    '/fr/a-propos/index': '/fr/',
    '/fr/accueil/index': '/fr/',
  },
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
});
