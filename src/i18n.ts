// UI strings and navigation, EN and FR (was _data/navigation.yml + the few _data/ui-text.yml keys in use).
export type Lang = 'en' | 'fr';

export type NavLink = { title: string; url: string };
export type NavGroup = { title: string; url?: string; items?: NavLink[] };

export const nav: Record<Lang, NavGroup[]> = {
  en: [
    { title: 'Research', items: [
      { title: 'Research', url: '/research/' },
      { title: 'Publications', url: '/publications/' },
      { title: 'Projects', url: '/projects/' },
    ] },
    { title: 'Teaching', items: [
      { title: 'Teaching', url: '/teaching/' },
      { title: 'Courses', url: '/selected_courses/' },
      { title: 'Course materials', url: '/teaching/materials/' },
    ] },
    { title: 'About', items: [
      { title: 'Biography', url: '/biography/' },
      { title: 'Education', url: '/education/' },
      { title: 'Industry', url: '/industry/' },
      { title: 'Honors & Skills', url: '/honors_and_extra/' },
      { title: 'Extracurricular', url: '/extracurricular/' },
      { title: 'Gallery', url: '/gallery/' },
    ] },
    { title: 'News', url: '/news/' },
    { title: 'CV & Contact', items: [
      { title: 'CV', url: '/cv/' },
      { title: 'Contact', url: '/contact/' },
    ] },
  ],
  fr: [
    { title: 'Recherche', items: [
      { title: 'Recherche', url: '/fr/recherche/' },
      { title: 'Publications', url: '/fr/publications/' },
      { title: 'Projets', url: '/fr/projets/' },
    ] },
    { title: 'Enseignement', items: [
      { title: 'Enseignement', url: '/fr/enseignement/' },
      { title: 'Cours', url: '/fr/cours/' },
      { title: 'Matériel de cours', url: '/fr/enseignement/materiel/' },
    ] },
    { title: 'À propos', items: [
      { title: 'Biographie', url: '/fr/biographie/' },
      { title: 'Formation', url: '/fr/formation/' },
      { title: 'Industrie', url: '/fr/experiences/' },
      { title: 'Distinctions et compétences', url: '/fr/distinctions/' },
      { title: 'Activités parascolaires', url: '/fr/activites/' },
      { title: 'Galerie', url: '/fr/galerie/' },
    ] },
    { title: 'Nouvelles', url: '/fr/nouvelles/' },
    { title: 'CV et contact', items: [
      { title: 'CV', url: '/fr/cv/' },
      { title: 'Contact', url: '/fr/contact/' },
    ] },
  ],
};

/** Every page link in the nav, in order. */
export const navLinks = (lang: Lang): NavLink[] => nav[lang].flatMap((g) => g.items ?? [{ title: g.title, url: g.url! }]);

/** The nav group a page belongs to (its title), or undefined for pages outside the nav. */
export function groupOf(path: string, lang: Lang): string | undefined {
  const norm = (u: string) => u.replace(/\/?$/, '/');
  const p = norm(path);
  let best: { title: string; len: number } | undefined;
  for (const g of nav[lang]) {
    for (const u of g.url ? [g.url] : (g.items ?? []).map((i) => i.url)) {
      const n = norm(u);
      if ((p === n || p.startsWith(n)) && n.length > (best?.len ?? 0)) best = { title: g.title, len: n.length };
    }
  }
  return best?.title;
}

export const ui = {
  en: {
    htmlLang: 'en-US', ogLocale: 'en_US', home: '/',
    skipNav: 'Skip to primary navigation', skipContent: 'Skip to content', skipFooter: 'Skip to footer',
    menu: 'Menu', menuClose: 'Close menu', navLabel: 'Main', groupPages: 'pages', search: 'Toggle search', searchPlaceholder: 'Search pages, papers and projects',
    langButton: 'EN, change language', langOther: 'Passer au français', langOtherText: 'Français', langCurrent: 'EN',
    themeToggle: 'Toggle colour theme', themeDark: 'Switch to dark theme', themeLight: 'Switch to light theme',
    updated: 'Updated:', shareOn: 'Share on', previous: 'Previous', next: 'Next',
    follow: 'Follow:', footerLine: 'Let’s talk research.', footerCta: 'Get in touch', footerNav: 'Site', licence: 'Course materials CC BY-NC-SA 4.0', poweredBy: 'Powered by',
    madeWith: 'Made with', love: 'love', madeFrom: 'from Canada',
    publishedIn: 'Published in', citation: 'Recommended citation:', download: 'Download', here: 'here',
    lightbox: 'Image viewer', lightboxClose: 'Close', lightboxPrev: 'Previous image', lightboxNext: 'Next image',
  },
  fr: {
    htmlLang: 'fr-CA', ogLocale: 'fr_CA', home: '/fr/',
    skipNav: 'Aller à la navigation principale', skipContent: 'Aller au contenu', skipFooter: 'Aller au pied de page',
    menu: 'Menu', menuClose: 'Fermer le menu', navLabel: 'Principale', groupPages: 'pages', search: 'Basculer la recherche', searchPlaceholder: 'Rechercher pages, articles et projets',
    langButton: 'FR, changer de langue', langOther: 'Switch to English', langOtherText: 'English', langCurrent: 'FR',
    themeToggle: 'Changer de thème', themeDark: 'Passer au thème sombre', themeLight: 'Passer au thème clair',
    updated: 'Mis à jour :', shareOn: 'Partager sur', previous: 'Précédent', next: 'Suivant',
    follow: 'Suivez-nous :', footerLine: 'Parlons recherche.', footerCta: 'Me joindre', footerNav: 'Site', licence: 'Supports de cours CC BY-NC-SA 4.0', poweredBy: 'Propulsé par',
    madeWith: 'Fait avec', love: 'amour', madeFrom: 'au Canada',
    publishedIn: 'Publié dans', citation: 'Citation recommandée :', download: 'Télécharger', here: 'ici',
    lightbox: 'Visionneuse d’images', lightboxClose: 'Fermer', lightboxPrev: 'Image précédente', lightboxNext: 'Image suivante',
  },
} as const;

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Dates in front matter are calendar dates; format them in UTC so the day never shifts.
export function formatDate(d: Date, lang: Lang, withDay = true): string {
  const m = d.getUTCMonth(), y = d.getUTCFullYear(), day = d.getUTCDate();
  if (lang === 'fr') return withDay ? `${day} ${MONTHS_FR[m]} ${y}` : `${MONTHS_FR[m]} ${y}`;
  return withDay ? `${MONTHS_EN[m]} ${day}, ${y}` : `${MONTHS_EN[m]} ${y}`;
}
