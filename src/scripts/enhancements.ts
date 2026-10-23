// Site behaviour, ported from assets/js/custom-enhancements.js and the jQuery plugins
// Minimal Mistakes bundled (greedy nav, Magnific Popup, lunr search, smooth scroll).
import { initHeroGraph } from './graph';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFrench = document.documentElement.lang.toLowerCase().startsWith('fr');
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Auto-updating "X yrs Y mos" durations (inclusive months) for .teaching-duration[data-start]. */
function updateDurations() {
  const now = new Date();
  for (const el of $$('.teaching-duration[data-start]')) {
    const [startY, startM] = (el.dataset.start ?? '').split('-').map(Number);
    if (!startY || !startM) continue;
    const [endY = now.getFullYear(), endM = now.getMonth() + 1] = (el.dataset.end ?? '').split('-').map(Number).filter(Boolean);
    const months = (endY - startY) * 12 + (endM - startM) + 1;
    if (months < 1) continue;
    const yrs = Math.floor(months / 12), mos = months % 12;
    const parts = isFrench
      ? [yrs && `${yrs} ${yrs > 1 ? 'ans' : 'an'}`, mos && `${mos} mois`]
      : [yrs && `${yrs} ${yrs > 1 ? 'yrs' : 'yr'}`, mos && `${mos} ${mos > 1 ? 'mos' : 'mo'}`];
    const text = parts.filter(Boolean).join(' ');
    if (text) el.textContent = text;
  }
}

/** In-page anchors scroll (respecting reduced motion) and move focus to the target. */
function addSmoothScrolling() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const href = a?.getAttribute('href');
    if (!a || !href || href === '#') return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
    history.pushState(null, '', href);
  });
}

/** External links open in a new tab; rel gains noopener/noreferrer but keeps rel="me". */
function enhanceExternalLinks() {
  for (const link of $$<HTMLAnchorElement>('a[href^="http"]')) {
    let url: URL;
    try { url = new URL(link.href); } catch { continue; }
    // the site's own absolute URLs (page titles link to them) are internal on any preview host too
    if (url.hostname === location.hostname || url.hostname === 'benymaxparsa.github.io') continue;
    const rel = new Set((link.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    rel.add('noopener').add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
    if (!link.hasAttribute('target')) link.target = '_blank';
    link.classList.add('external-link');
    if (!link.title) link.title = (isFrench ? 'S’ouvre dans un nouvel onglet : ' : 'Opens in new tab: ') + ((link.textContent ?? '').trim() || url.hostname);
  }
}

/** Permalink anchors on content headings (was Minimal Mistakes' _main.js). */
function addHeaderLinks() {
  for (const h of $$('.page__content :is(h1, h2, h3, h4, h5, h6)[id]')) {
    const a = document.createElement('a');
    a.className = 'header-link';
    a.href = `#${h.id}`;
    a.title = 'Permalink';
    a.innerHTML = '<span class="sr-only">Permalink</span><i class="fas fa-link" aria-hidden="true"></i>';
    h.append(a);
  }
}

/** Share buttons open a small window instead of navigating away. */
function initSharePopups() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-share-popup]');
    if (!a) return;
    e.preventDefault();
    window.open(a.href, 'window', 'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
  });
}

/** Thin reading-progress bar across the top of the viewport. */
function addReadingProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  let ticking = false;
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${Math.min(100, Math.max(0, scrollable > 0 ? (scrollY / scrollable) * 100 : 0))}%`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

function addScrollToTopButton() {
  const button = document.createElement('button');
  button.className = 'scroll-to-top';
  button.textContent = '↑';
  button.setAttribute('aria-label', isFrench ? 'Retour en haut' : 'Scroll to top');
  button.style.display = 'none';
  document.body.append(button);
  let visible = false;
  addEventListener('scroll', () => {
    const show = scrollY > 300;
    if (show && !visible) {
      button.style.display = 'block';
      setTimeout(() => button.classList.add('visible'), 10);
    } else if (!show && visible) {
      button.classList.remove('visible');
      setTimeout(() => { button.style.display = 'none'; }, 300);
    }
    visible = show;
  }, { passive: true });
  button.addEventListener('click', () => scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
}

/**
 * Light/dark switch. With no saved choice the CSS follows the system; a click pins the
 * opposite of what is showing (Base.astro re-applies it before paint on later pages).
 * Fires "themechange" so the hero graph can repaint.
 */
function initThemeToggle() {
  const btn = $('.theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.getAttribute('data-theme') ?? (mq.matches ? 'dark' : 'light');
  const sync = () => {
    const dark = current() === 'dark';
    const label = btn.getAttribute(dark ? 'data-label-light' : 'data-label-dark') ?? '';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    for (const m of $$('meta[name="theme-color"]')) m.setAttribute('content', dark ? '#121821' : '#f7f8fa');
    document.dispatchEvent(new CustomEvent('themechange'));
  };
  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* storage blocked */ }
    sync();
  });
  mq.addEventListener('change', () => { if (!root.getAttribute('data-theme')) sync(); });
  sync();
}

/** Language dropdown: click/tap only (never hover), Esc and outside click close it. */
function initLanguageSwitcher() {
  const dropdown = $('.lang-dropdown');
  const toggle = $('.lang-current');
  if (!dropdown || !toggle) return;
  const setOpen = (open: boolean) => {
    dropdown.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!dropdown.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (!dropdown.contains(e.target as Node)) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
  for (const link of $$<HTMLAnchorElement>('.lang-switch-link', dropdown)) {
    link.addEventListener('click', () => {
      try { localStorage.setItem('preferredLanguage', link.dataset.lang ?? ''); } catch { /* storage blocked */ }
    });
  }
}

/**
 * Header nav that moves links which don't fit into the overflow ("more") menu, in order
 * from the end. Replaces the jQuery greedy-nav; measures again on resize and once web
 * fonts have arrived, since they change every link's width.
 */
function initNav() {
  const nav = $('nav.greedy-nav');
  const vlinks = nav && $('.visible-links', nav);
  const hlinks = nav && $('.hidden-links', nav);
  const btn = nav && $<HTMLButtonElement>('.greedy-nav__toggle', nav);
  if (!nav || !vlinks || !hlinks || !btn) return;
  const items = [...vlinks.children] as HTMLElement[];
  const fixed = ['.site-logo', '.site-title', '.language-switcher', '.theme-toggle', '.search__toggle'].map((s) => $(s, nav));
  const outer = (el: HTMLElement | null) => {
    if (!el || getComputedStyle(el).display === 'none') return 0;
    const s = getComputedStyle(el);
    return el.getBoundingClientRect().width + parseFloat(s.marginLeft) + parseFloat(s.marginRight);
  };
  const isOpen = () => !hlinks.classList.contains('hidden');
  const setOpen = (open: boolean) => {
    hlinks.classList.toggle('hidden', !open);
    btn.classList.toggle('close', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  let lastWidth = -1;
  function layout() {
    if (nav!.clientWidth === lastWidth) return;
    lastWidth = nav!.clientWidth;
    items.forEach((li) => vlinks!.append(li));
    const widths = items.map(outer);
    let available = nav!.clientWidth - fixed.reduce((sum, el) => sum + outer(el), 0);
    let fit = items.length;
    if (widths.reduce((a, b) => a + b, 0) > available) {
      btn!.classList.remove('hidden');
      available -= outer(btn!);
      let used = 0;
      fit = 0;
      while (fit < items.length && used + widths[fit] <= available) used += widths[fit++];
    }
    items.forEach((li, i) => (i < fit ? vlinks! : hlinks!).append(li));
    btn!.classList.toggle('hidden', fit === items.length);
    btn!.setAttribute('count', String(items.length - fit));
    if (fit === items.length) setOpen(false);
  }

  btn.addEventListener('click', () => setOpen(!isOpen()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !hlinks.contains(e.target as Node) && !btn.contains(e.target as Node)) setOpen(false);
  });
  new ResizeObserver(layout).observe(nav);
  document.fonts?.ready.then(() => { lastWidth = -1; layout(); });
}

/** Search overlay backed by Pagefind; the index is split by <html lang>, so results stay in the page language. */
function initSearch() {
  const toggle = $<HTMLButtonElement>('.search__toggle');
  const panel = $('.search-content');
  const content = $('.initial-content');
  const input = $<HTMLInputElement>('#search');
  const results = $('#results');
  if (!toggle || !panel || !content || !input || !results) return;

  type Pagefind = { search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }> }[] }> };
  let pagefind: Promise<Pagefind> | undefined;
  const load = () => (pagefind ??= import(/* @vite-ignore */ '/pagefind/pagefind.js' as string) as Promise<Pagefind>);

  const isOpen = () => panel.classList.contains('is--visible');
  const setOpen = (open: boolean) => {
    panel.classList.toggle('is--visible', open);
    content.classList.toggle('is--hidden', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) { load(); setTimeout(() => input.focus(), 50); }
    else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));

  let seq = 0;
  input.addEventListener('input', async () => {
    const q = input.value.trim();
    const mine = ++seq;
    if (!q) { results.innerHTML = ''; return; }
    const { results: hits } = await (await load()).search(q);
    const data = await Promise.all(hits.slice(0, 20).map((h) => h.data()));
    if (mine !== seq) return; // a newer query is already showing
    const el = (tag: string, cls: string) => Object.assign(document.createElement(tag), { className: cls });
    const found = el('p', 'results__found');
    found.textContent = `${data.length} ${isFrench ? 'Résultat(s) trouvé(s)' : 'Result(s) found'}`;
    results.replaceChildren(found, ...data.map((d) => {
      const item = el('div', 'list__item');
      const article = item.appendChild(el('article', 'archive__item'));
      const a = article.appendChild(el('h2', 'archive__item-title')).appendChild(el('a', '')) as HTMLAnchorElement;
      a.href = d.url.replace(/(?<!\/404)\.html$/, ''); // Pagefind records files; link the canonical URL
      a.textContent = d.meta.title ?? d.url;
      // Pagefind's excerpt is escaped page text with <mark> highlights
      article.appendChild(el('p', 'archive__item-excerpt')).innerHTML = d.excerpt;
      return item;
    }));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); return; }
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable)) return;
    e.preventDefault();
    if (!isOpen()) setOpen(true);
  });
}

/** Image lightbox on a native <dialog>: arrows step through the page's images, Esc closes. */
function initLightbox() {
  const dialog = $<HTMLDialogElement>('dialog.lightbox');
  if (!dialog) return;
  const links = $$<HTMLAnchorElement>('a').filter((a) =>
    /\.(jpe?g|png|gif|webp)$/i.test(new URL(a.href, location.href).pathname) && a.querySelector(':scope > img'));
  if (!links.length) return;
  const img = $<HTMLImageElement>('.lightbox__img', dialog)!;
  const caption = $('.lightbox__caption', dialog)!;
  let index = 0;
  let opener: HTMLElement | null = null;
  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const a = links[index];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt ?? '';
    caption.textContent = a.title || img.alt;
    dialog.classList.toggle('lightbox--single', links.length === 1);
  };
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let middle/modified clicks open the image
    e.preventDefault();
    opener = a;
    show(i);
    dialog.showModal();
    document.documentElement.classList.add('lightbox-open');
  }));
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    img.removeAttribute('src');
    opener?.focus();
  });
  $('.lightbox__prev', dialog)!.addEventListener('click', () => show(index - 1));
  $('.lightbox__next', dialog)!.addEventListener('click', () => show(index + 1));
  $('.lightbox__close', dialog)!.addEventListener('click', () => dialog.close());
  img.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
}

/** Fade in natively lazy-loaded images that haven't arrived yet. */
function enhanceLazyLoading() {
  for (const img of $$<HTMLImageElement>('img[loading="lazy"]')) {
    if (img.complete) continue;
    img.classList.add('lazy-fade');
    const done = () => img.classList.add('loaded');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
}

addSmoothScrolling();
enhanceExternalLinks();
addHeaderLinks();
initSharePopups();
addReadingProgressBar();
addScrollToTopButton();
initThemeToggle();
initLanguageSwitcher();
initNav();
initSearch();
initLightbox();
enhanceLazyLoading();
updateDurations();
initHeroGraph(prefersReducedMotion);
