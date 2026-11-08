// Plan §6 steps 4-5: real clicks and keys against a running server.
// Usage: node scripts/behaviour.mjs <baseUrl>
import puppeteer from 'puppeteer-core';

const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(path, { width = 1280, motion = 'reduce', storage = {} } = {}) {
  const page = await browser.newPage();
  // reset storage once per tab, not on every navigation
  await page.evaluateOnNewDocument((s) => { try { if (!sessionStorage.__init) { localStorage.clear(); for (const k in s) localStorage.setItem(k, s[k]); sessionStorage.__init = '1'; } } catch {} }, storage);
  await page.setViewport({ width, height: 900, isMobile: width < 500, hasTouch: width < 500 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: motion }]);
  await page.goto(base + path, { waitUntil: 'networkidle0' });
  return page;
}
const active = (page) => page.evaluate(() => document.activeElement?.className ?? '');

try {
  // 1. Grouped navigation
  {
    for (const path of ['/', '/fr/']) {
      const page = await open(path, { width: 1280 });
      check(`nav: 5 groups in pill (${path})`, await page.$$eval('#site-nav .nav-group', (g) => g.length) === 5);
      await page.close();
    }
    const page = await open('/', { width: 1280 });
    const btn = '#site-nav .nav-group:first-child > button';
    await page.click(btn);
    check('nav: dropdown opens on click', await page.$eval(btn, (b) => b.getAttribute('aria-expanded') === 'true')
      && await page.$eval(btn, (b) => { const p = document.getElementById(b.getAttribute('aria-controls')); return !p.hidden && p.querySelectorAll('a').length === 3; }));
    await page.keyboard.press('Escape');
    check('nav: Esc closes and returns focus', await page.$eval(btn, (b) => b.getAttribute('aria-expanded') === 'false' && document.activeElement === b));
    await page.click(btn);
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    check('nav: tabbing out closes dropdown', await page.$eval(btn, (b) => b.getAttribute('aria-expanded') === 'false'));
    await page.click(btn);
    await page.mouse.click(200, 700);
    check('nav: outside click closes', await page.$eval(btn, (b) => b.getAttribute('aria-expanded') === 'false'));
    await page.close();
    const fr = await open('/fr/', { width: 1024 });
    check('nav: FR fits at 1024px', await fr.$eval('.nav-pill', (n) => n.scrollWidth <= n.clientWidth + 1 && n.getBoundingClientRect().height < 80));
    await fr.close();
    const phone = await open('/', { width: 390 });
    await phone.click('.nav-menu-btn');
    check('nav: phone overlay', await phone.$eval('#site-menu', (m) => { const r = m.getBoundingClientRect(); return !m.hidden && r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && m.querySelectorAll('a').length === 15; }));
    await phone.keyboard.press('Escape');
    check('nav: phone overlay closes on Esc', await phone.$eval('#site-menu', (m) => m.hidden) && await phone.$eval('.nav-menu-btn', (b) => document.activeElement === b));
    await phone.close();
    const pubs = await open('/publications/', { width: 1280 });
    check('nav: current group marked', await pubs.$eval('#site-nav .nav-group:first-child > button', (b) => b.getAttribute('aria-current') === 'true'));
    await pubs.close();
  }

  // 2. Language switch (a plain link to the twin page)
  {
    const page = await open('/teaching/Fall-2021-DA');
    check('lang: links to the doc twin', await page.$eval('.lang-switch-link', (a) => a.getAttribute('href') === '/fr/enseignement/Fall-2021-DA'));
    check('lang: accessible name names the other language', await page.$eval('.lang-switch-link', (a) => /français/i.test(a.getAttribute('aria-label'))));
    await Promise.all([page.waitForNavigation(), page.click('.lang-switch-link')]);
    check('lang: switch lands on FR twin and stores preference',
      page.url().endsWith('/fr/enseignement/Fall-2021-DA') && await page.evaluate(() => localStorage.getItem('preferredLanguage') === 'fr'));
    await page.goto(base + '/', { waitUntil: 'networkidle0' });
    check('lang: / redirects to /fr/ when preference is fr', new URL(page.url()).pathname === '/fr/');
    await page.close();
  }

  // 3. Search
  for (const [path, word, lang] of [['/', 'Spider', 'en'], ['/fr/', 'Spider', 'fr']]) {
    const page = await open(path);
    await page.keyboard.press('/');
    await sleep(200);
    check(`search ${lang}: "/" opens and focuses input`, await page.$eval('dialog.search-dialog', (d) => d.open) && await page.evaluate(() => document.activeElement?.id === 'search'));
    await page.keyboard.type(word);
    await page.waitForFunction(() => document.querySelectorAll('#results a.search-hit').length > 0, { timeout: 5000 }).catch(() => {});
    const urls = await page.$$eval('#results a.search-hit', (as) => as.map((a) => new URL(a.href).pathname));
    const inLang = urls.every((u) => (lang === 'fr' ? /^\/fr\/|-fr\/$/.test(u) : !/^\/fr\/|-fr\/$/.test(u)));
    check(`search ${lang}: results only in page language`, urls.length > 0 && inLang, `${urls.length} results: ${urls.slice(0, 3).join(', ')}`);
    await page.keyboard.press('Escape');
    check(`search ${lang}: Esc closes, focus returns to toggle`,
      await page.$eval('dialog.search-dialog', (d) => !d.open) && (await active(page)).includes('search__toggle'));
    await page.close();
  }

  // 4. Lightbox
  {
    const page = await open('/teaching/');
    const links = await page.$$('.teaching-award__photo a');
    await links[0].click();
    await sleep(150);
    check('lightbox: opens as modal with scroll lock', await page.$eval('dialog.lightbox', (d) => d.open) && await page.evaluate(() => document.documentElement.classList.contains('lightbox-open')));
    const first = await page.$eval('.lightbox__img', (i) => i.src);
    await page.keyboard.press('ArrowRight');
    check('lightbox: ArrowRight shows next image', await page.$eval('.lightbox__img', (i) => i.src) !== first);
    await page.keyboard.press('Escape');
    await sleep(100);
    check('lightbox: Esc closes, scroll lock released, focus restored',
      await page.$eval('dialog.lightbox', (d) => !d.open) && await page.evaluate(() => !document.documentElement.classList.contains('lightbox-open') && document.activeElement?.closest('.teaching-award__photo') !== null));
    await page.close();
  }

  // 5. Theme toggle persists with no flash
  {
    const page = await open('/');
    await page.click('.theme-toggle');
    check('theme: toggle sets data-theme and storage', await page.evaluate(() => document.documentElement.dataset.theme === 'dark' && localStorage.getItem('theme') === 'dark'));
    check('theme: theme-color meta updated', await page.$eval('meta[name="theme-color"]', (m) => m.content === '#141413'));
    await page.evaluateOnNewDocument(() => document.addEventListener('DOMContentLoaded', () => { window.__themeAtDcl = document.documentElement.dataset.theme; }));
    await page.goto(base + '/publications/', { waitUntil: 'networkidle0' });
    check('theme: applied before first paint on next page', await page.evaluate(() => window.__themeAtDcl === 'dark'));
    await page.close();
  }

  // 6. Hero graph
  {
    const reduced = await open('/');
    check('graph: reduced motion shows final state', await reduced.$eval('.hero-graph__status', (s) => /found \d+ communities/.test(s.textContent)));
    await reduced.close();
    const page = await open('/', { motion: 'no-preference' });
    await page.evaluate(() => { window.__raf = 0; const r = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => { window.__raf++; return r(cb); }; });
    await page.waitForFunction(() => /found \d+ communities/.test(document.querySelector('.hero-graph__status').textContent), { timeout: 20000 }).catch(() => {});
    check('graph: animated run converges', await page.$eval('.hero-graph__status', (s) => /found \d+ communities/.test(s.textContent)));
    let settled = false;
    for (let i = 0; i < 60 && !settled; i++) { const n = await page.evaluate(() => window.__raf); await sleep(1000); settled = await page.evaluate((n) => window.__raf === n, n); }
    check('graph: stops when settled', settled);
    const t = await page.evaluate(() => { const s = performance.now(); document.querySelector('.hero-graph__again').click(); return performance.now() - s; });
    check('graph: "New graph" responds in < 16 ms', t < 16, `${t.toFixed(1)} ms`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(300);
    const n1 = await page.evaluate(() => window.__raf); await sleep(500);
    check('graph: pauses offscreen', await page.evaluate((n) => window.__raf - n <= 1, n1));
    await page.close();
  }

  // Footer
  for (const path of ['/', '/fr/']) {
    const page = await open(path);
    const f = await page.evaluate(() => ({
      cols: document.querySelectorAll('.footer-cols > *').length,
      social: document.querySelectorAll('.footer-social a').length,
      line: document.querySelector('.footer-line')?.textContent.trim(),
    }));
    check(`footer: 4 link columns + socials (${path})`, f.cols === 4 && f.social === 9 && !!f.line, JSON.stringify(f));
    await page.close();
  }

  // 7-13. Smaller features
  {
    const page = await open('/teaching/');
    const want = await page.evaluate(() => { const now = new Date(); const m = (now.getFullYear() - 2024) * 12 + (now.getMonth() + 1 - 9) + 1; const y = Math.floor(m / 12), mo = m % 12; return [y && `${y} ${y > 1 ? 'yrs' : 'yr'}`, mo && `${mo} ${mo > 1 ? 'mos' : 'mo'}`].filter(Boolean).join(' '); });
    check('duration: correct for today', await page.$eval('.teaching-duration[data-start]', (e) => e.textContent) === want, want);
    await page.evaluate(() => window.scrollTo(0, 1200)); await sleep(400);
    check('scroll-to-top and progress bar', await page.$eval('.scroll-to-top', (b) => b.classList.contains('visible')) && await page.$eval('.reading-progress', (b) => parseFloat(b.style.width) > 0));
    await page.close();
    const contact = await open('/contact/');
    const ext = await contact.$$eval('a.contact-link[rel~="me"][href^="https://github.com"]', (as) => as.map((a) => [a.target, a.rel, getComputedStyle(a, '::after').content]));
    check('external links: _blank, keeps rel=me, adds noopener noreferrer, no marker on contact links',
      ext.length > 0 && ext.every(([t, rel, after]) => t === '_blank' && /\bme\b/.test(rel) && /noopener/.test(rel) && /noreferrer/.test(rel) && (after === 'none' || after === 'normal')));
    check('header permalinks present and hidden label', await contact.$$eval('.page__content h2 .header-link .sr-only', (s) => s.length > 0 && s.every((e) => e.getBoundingClientRect().width <= 1)));
    await contact.close();
    const pub = await open('/publication/p6');
    check('external link marker in body text', await pub.$$eval('.page__content a.external-link', (as) => as.some((a) => getComputedStyle(a, '::after').content.includes('↗'))));
    await pub.close();
    const cv = await open('/cv/');
    await cv.select('#cv-lang', '/files/FR_ParsaKamalipour_CV.pdf');
    check('cv: selector switches the preview', await cv.$eval('#cv-frame', (f) => f.getAttribute('src') === '/files/FR_ParsaKamalipour_CV.pdf'));
    await cv.close();
    const mat = await open('/fr/enseignement/materiel/');
    check('course materials: FR page lists files', await mat.$$eval('.material-link', (as) => as.length) > 0);
    await mat.close();
    const nf = await browser.newPage();
    const r = await nf.goto(base + '/no-such-page', { waitUntil: 'load' });
    check('404: status 404 with search hint', r.status() === 404 && (await nf.content()).includes('<kbd>/</kbd>'));
    await nf.close();
    const doc = await open('/projects/A-star/');
    const alt = await doc.$$eval('link[rel=alternate][hreflang]', (ls) => Object.fromEntries(ls.map((l) => [l.hreflang, new URL(l.href).pathname])));
    check('hreflang alternates point at real twins', alt.en === '/projects/A-star/' && alt['fr-CA'] === '/projects/A-star-fr/' && alt['x-default'] === '/projects/A-star/', JSON.stringify(alt));
    await doc.close();
    const skip = await open('/');
    await skip.keyboard.press('Tab');
    check('skip link is first focus stop', (await active(skip)).includes('screen-reader-shortcut'));
    await skip.close();
  }

  // §6.5 Header layout across widths
  const widths = [1600, 1440, 1280, 1180, 1100, 1024, 960, 900, 820, 768, 700, 600, 480, 390, 360, 320];
  const failures = [];
  for (const path of ['/', '/fr/']) {
    for (const w of widths) {
      const page = await open(path, { width: w });
      const res = await page.evaluate(() => {
        const pill = document.querySelector('.nav-pill');
        const kids = [...pill.querySelectorAll('.nav-brand, .nav-group, .nav-tools > *, .nav-menu-btn')].filter((e) => e.checkVisibility());
        const problems = [];
        const pr = pill.getBoundingClientRect();
        for (let i = 0; i < kids.length; i++) {
          const a = kids[i].getBoundingClientRect();
          if (a.right > pr.right + 1 || a.left < pr.left - 1) problems.push(`clipped ${kids[i].className}`);
          for (let j = i + 1; j < kids.length; j++) {
            const b = kids[j].getBoundingClientRect();
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) problems.push(`${kids[i].className} overlaps ${kids[j].className}`);
          }
        }
        if (document.documentElement.scrollWidth > innerWidth) problems.push('page overflows');
        return { problems, height: pr.height };
      });
      if (res.problems.length) failures.push(`${path} @${w}: ${res.problems.join('; ')}`);
      if (res.height > 72) failures.push(`${path} @${w}: header ${res.height}px tall`);
      await page.close();
    }
  }
  check(`header layout: ${widths.length} widths × EN/FR, no overlap or clipping`, failures.length === 0, failures.join(' | '));
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
