// UI strings and navigation, EN and FR (was _data/navigation.yml + the few _data/ui-text.yml keys in use).
export type Lang = 'en' | 'fr';

export const nav: Record<Lang, { title: string; url: string }[]> = {
  // Primary items first: the overflow menu takes whatever doesn't fit, from the end
  en: [
    { title: 'Research', url: '/research/' },
    { title: 'Publications', url: '/publications/' },
    { title: 'Teaching', url: '/teaching/' },
    { title: 'CV', url: '/cv/' },
    { title: 'News', url: '/news/' },
    { title: 'Contact', url: '/contact/' },
    { title: 'Biography', url: '/biography/' },
    { title: 'Education', url: '/education/' },
    { title: 'Projects', url: '/projects/' },
    { title: 'Courses', url: '/selected_courses/' },
    { title: 'Honors & Skills', url: '/honors_and_extra/' },
    { title: 'Industry', url: '/industry/' },
    { title: 'Extracurricular', url: '/extracurricular/' },
  ],
  fr: [
    { title: 'Recherche', url: '/fr/recherche/' },
    { title: 'Publications', url: '/fr/publications/' },
    { title: 'Enseignement', url: '/fr/enseignement/' },
    { title: 'CV', url: '/fr/cv/' },
    { title: 'Nouvelles', url: '/fr/nouvelles/' },
    { title: 'Contact', url: '/fr/contact/' },
    { title: 'Biographie', url: '/fr/biographie/' },
    { title: 'Formation', url: '/fr/formation/' },
    { title: 'Projets', url: '/fr/projets/' },
    { title: 'Cours', url: '/fr/cours/' },
    { title: 'Distinctions et compétences', url: '/fr/distinctions/' },
    { title: 'Industrie', url: '/fr/experiences/' },
    { title: 'Activités parascolaires', url: '/fr/activites/' },
  ],
};

export const ui = {
  en: {
    htmlLang: 'en-US', ogLocale: 'en_US', home: '/',
    skipNav: 'Skip to primary navigation', skipContent: 'Skip to content', skipFooter: 'Skip to footer',
    menu: 'Toggle menu', search: 'Toggle search', searchPlaceholder: 'Search pages, papers and projects',
    langButton: 'EN, change language', langOther: 'Passer au français', langOtherText: 'Français', langCurrent: 'EN',
    themeToggle: 'Toggle colour theme', themeDark: 'Switch to dark theme', themeLight: 'Switch to light theme',
    updated: 'Updated:', shareOn: 'Share on', previous: 'Previous', next: 'Next',
    follow: 'Follow:', poweredBy: 'Powered by',
    madeWith: 'Made with', love: 'love', madeFrom: 'from Canada',
    publishedIn: 'Published in', citation: 'Recommended citation:', download: 'Download', here: 'here',
    lightbox: 'Image viewer', lightboxClose: 'Close', lightboxPrev: 'Previous image', lightboxNext: 'Next image',
  },
  fr: {
    htmlLang: 'fr-CA', ogLocale: 'fr_CA', home: '/fr/',
    skipNav: 'Aller à la navigation principale', skipContent: 'Aller au contenu', skipFooter: 'Aller au pied de page',
    menu: 'Basculer le menu', search: 'Basculer la recherche', searchPlaceholder: 'Rechercher pages, articles et projets',
    langButton: 'FR, changer de langue', langOther: 'Switch to English', langOtherText: 'English', langCurrent: 'FR',
    themeToggle: 'Changer de thème', themeDark: 'Passer au thème sombre', themeLight: 'Passer au thème clair',
    updated: 'Mis à jour :', shareOn: 'Partager sur', previous: 'Précédent', next: 'Suivant',
    follow: 'Suivez-nous :', poweredBy: 'Propulsé par',
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
