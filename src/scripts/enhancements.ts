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
    // transform, not width: no layout on every scroll frame
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollable > 0 ? scrollY / scrollable : 0))})`;
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
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch { /* storage blocked */ }
      sync();
    };
    // Crossfade the page while the switch's knob slides (it has its own transition name)
    if (document.startViewTransition && !prefersReducedMotion) document.startViewTransition(apply);
    else apply();
  });
  mq.addEventListener('change', () => { if (!root.getAttribute('data-theme')) sync(); });
  sync();
}

/**
 * Language pill: remember an explicit choice (so the bare / URL can send the visitor to their language next
 * time), and slide the knob to the other language before going there.
 */
function initLanguageSwitcher() {
  const box = $('.language-switcher');
  for (const link of $$<HTMLAnchorElement>('.lang-switch-link')) {
    link.addEventListener('click', (e) => {
      try { localStorage.setItem('preferredLanguage', link.dataset.lang ?? ''); } catch { /* storage blocked */ }
      if (!box || prefersReducedMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      box.dataset.pos = box.dataset.pos === '1' ? '0' : '1';
      box.classList.add('is-switching');
      setTimeout(() => { location.href = link.href; }, 280);
    });
  }
  // The back button restores this page from cache mid-slide: put the knob back
  addEventListener('pageshow', (e) => {
    if (!e.persisted || !box) return;
    box.dataset.pos = isFrench ? '1' : '0';
    box.classList.remove('is-switching');
  });
}

/**
 * Nav bubble: a soft pill behind the current link glides to the link you click, then the page opens.
 * A second click re-targets instead of stacking navigations. Only links still in the bar get it
 * (the greedy nav may have moved some into the overflow menu).
 */
function initNavBubble() {
  const list = $('.visible-links');
  const nav = $('nav.greedy-nav');
  if (!list || !nav) return;
  const bubble = document.createElement('li');
  bubble.className = 'nav-bubble no-anim';
  bubble.setAttribute('aria-hidden', 'true');
  list.prepend(bubble);
  list.classList.add('has-bubble');
  const current = () => $<HTMLAnchorElement>('a[aria-current="page"]', list);
  const place = (a: HTMLElement | null) => {
    if (!a || !list.contains(a)) { bubble.classList.remove('is-placed'); return; }
    const l = list.getBoundingClientRect(), r = a.getBoundingClientRect();
    const padX = 10, padY = 3;
    bubble.style.transform = `translate(${r.left - l.left - padX}px, ${r.top - l.top - padY}px)`;
    bubble.style.width = `${r.width + padX * 2}px`;
    bubble.style.height = `${r.height + padY * 2}px`;
    bubble.classList.add('is-placed');
  };
  const settle = () => {
    bubble.classList.add('no-anim');
    place(current());
    requestAnimationFrame(() => bubble.classList.remove('no-anim'));
  };
  settle();
  new ResizeObserver(settle).observe(nav);
  document.fonts?.ready.then(settle);

  let timer = 0;
  for (const a of $$<HTMLAnchorElement>('a', list)) {
    a.addEventListener('click', (e) => {
      if (prefersReducedMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button || a.matches('[aria-current="page"]')) return;
      if (!bubble.classList.contains('is-placed') || !list.contains(a)) return; // nothing to glide from, or the link sits in the overflow menu
      e.preventDefault();
      place(a);
      for (const x of $$('a', list)) {
        x.classList.toggle('is-target', x === a);
        x.classList.toggle('is-leaving', x !== a && x.matches('[aria-current="page"]'));
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => { location.href = a.href; }, 220);
    });
  }
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    for (const x of $$('.is-target, .is-leaving', list)) x.classList.remove('is-target', 'is-leaving');
    settle();
  });
}

/** Search overlay backed by Pagefind; the index is split by <html lang>, so results stay in the page language. */
function initSearch() {
  const toggle = $<HTMLButtonElement>('.search__toggle');
  const dialog = $<HTMLDialogElement>('dialog.search-dialog');
  const input = $<HTMLInputElement>('#search');
  const results = $('#results');
  if (!toggle || !dialog || !input || !results) return;

  type Pagefind = { search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }> }[] }> };
  let pagefind: Promise<Pagefind> | undefined;
  const load = () => (pagefind ??= import(/* @vite-ignore */ '/pagefind/pagefind.js' as string) as Promise<Pagefind>);
  const el = (tag: string, cls: string) => Object.assign(document.createElement(tag), { className: cls });
  const message = (text: string) => { const p = el('p', 'search-dialog__message'); p.textContent = text; results.replaceChildren(p); };
  const hint = () => message(isFrench
    ? 'Essayez un titre d’article, un sigle de cours ou un sujet comme « détection de communautés ».'
    : 'Try a paper title, a course code or a topic like “community detection”.');

  // Native modal: Esc, focus trap and the inert page behind come from <dialog>
  const open = () => {
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add('lightbox-open');
    toggle.setAttribute('aria-expanded', 'true');
    load();
    if (!input.value.trim()) hint();
    input.focus();
  };
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });
  toggle.addEventListener('click', open);
  $('.search-dialog__close', dialog)?.addEventListener('click', () => dialog.close());
  // A click on the backdrop lands on the <dialog> itself, outside its box
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });

  let seq = 0;
  input.addEventListener('input', async () => {
    const q = input.value.trim();
    const mine = ++seq;
    if (!q) { hint(); return; }
    const { results: hits } = await (await load()).search(q);
    const data = await Promise.all(hits.slice(0, 20).map((h) => h.data()));
    if (mine !== seq) return; // a newer query is already showing
    if (!data.length) { message(isFrench ? `Aucun résultat pour « ${q} ».` : `No results for “${q}”.`); return; }
    const found = el('p', 'search-dialog__count');
    found.textContent = isFrench ? `${data.length} résultat${data.length > 1 ? 's' : ''}` : `${data.length} result${data.length === 1 ? '' : 's'}`;
    const list = el('ul', 'search-hits');
    list.append(...data.map((d) => {
      const a = el('a', 'search-hit') as HTMLAnchorElement;
      a.href = d.url.replace(/(?<!\/404)\.html$/, ''); // Pagefind records files; link the canonical URL
      a.appendChild(el('span', 'search-hit__title')).textContent = d.meta.title ?? d.url;
      // Pagefind's excerpt is escaped page text with <mark> highlights
      a.appendChild(el('span', 'search-hit__excerpt')).innerHTML = d.excerpt;
      const li = el('li', '');
      li.append(a);
      return li;
    }));
    results.replaceChildren(found, list);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable)) return;
    e.preventDefault();
    open();
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
  const counter = $('.lightbox__counter', dialog)!;
  let index = 0;
  let opener: HTMLElement | null = null;
  let seq = 0;
  // The picture zooms/fades in once decoded, and fades out before the next one replaces it
  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const a = links[index];
    const mine = ++seq;
    img.classList.remove('ready');
    const swap = () => {
      if (mine !== seq) return; // a newer step is already on its way
      img.src = a.href;
      img.alt = a.querySelector('img')?.alt ?? '';
      caption.textContent = a.title || img.alt;
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { if (mine === seq) img.classList.add('ready'); });
    };
    if (img.getAttribute('src') && !prefersReducedMotion) setTimeout(swap, 150); else swap();
    counter.textContent = `${index + 1} / ${links.length}`;
    dialog.classList.toggle('lightbox--single', links.length === 1);
    // Warm the neighbours so stepping through feels instant
    for (const n of [index - 1, index + 1]) new Image().src = links[(n + links.length) % links.length].href;
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
    seq++;
    img.classList.remove('ready');
    img.removeAttribute('src');
    opener?.focus();
  });
  // Swipe sideways on touch screens to step; vertical drags are left alone
  let sx: number | null = null, sy = 0;
  dialog.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (sx === null || links.length < 2) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
    sx = null;
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

/**
 * Card slideshows (markup from lib/cards.ts): arrows, dots, swipe, and a slow autoplay that waits while
 * the card is hovered or off screen and stops for good once you step through it yourself.
 */
function initSlideshows() {
  for (const box of $$('figure.is-slides')) {
    const slides = $$<HTMLAnchorElement>(':scope > a', box);
    const dots = $$(':scope > .slide-dots span', box);
    let i = 0, visible = false, hovering = false, userStepped = false, swiped = false;
    const show = (n: number) => {
      slides[i].classList.remove('is-active');
      dots[i]?.classList.remove('is-on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      dots[i]?.classList.add('is-on');
    };
    const step = (d: number) => { userStepped = true; show(i + d); };
    $('.slide-prev', box)?.addEventListener('click', () => step(-1));
    $('.slide-next', box)?.addEventListener('click', () => step(1));
    let sx: number | null = null, sy = 0;
    box.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) { step(dx < 0 ? 1 : -1); swiped = true; }
      sx = null;
    });
    // the tap that ends a swipe must not also open the viewer
    box.addEventListener('click', (e) => { if (swiped) { swiped = false; e.preventDefault(); e.stopPropagation(); } }, true);
    if (prefersReducedMotion) continue;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(box);
    box.addEventListener('mouseenter', () => { hovering = true; });
    box.addEventListener('mouseleave', () => { hovering = false; });
    box.addEventListener('focusin', () => { hovering = true; });
    box.addEventListener('focusout', () => { hovering = false; });
    setInterval(() => { if (visible && !hovering && !userStepped && !document.hidden) show(i + 1); }, 5000);
  }
}

/** Listing cards that start below the first screen slide up as they arrive; nothing already on screen is hidden. */
function initReveal() {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -40px 0px' });
  for (const el of $$('.list__item')) {
    el.classList.add('reveal');
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); }
  }
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
initNavBubble();
initSearch();
initLightbox();
initSlideshows();
initReveal();
enhanceLazyLoading();
updateDurations();
initHeroGraph(prefersReducedMotion);
