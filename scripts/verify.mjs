// Verification suite (plan §6 steps 2, 3, 8) against a running server.
// Usage: node scripts/verify.mjs <crawl|audit|shots|all> <baseUrl> <outDir>
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [cmd = 'all', base = 'http://localhost:4321', outDir = 'docs/migration/report'] = process.argv.slice(2);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOT_PAGES = ['/', '/teaching/', '/publications/', '/projects/CommunityGNN/', '/cv/', '/contact/', '/fr/'];
mkdirSync(outDir, { recursive: true });

async function sitemapUrls() {
  const xml = await (await fetch(base + '/sitemap.xml')).text();
  let locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // sitemap index (Astro) → follow child sitemaps
  if (/<sitemapindex/.test(xml)) {
    const child = await Promise.all(locs.map(async (l) => (await fetch(base + new URL(l).pathname)).text()));
    locs = child.flatMap((x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return locs.map((l) => new URL(l).pathname).filter((p) => !/\.(pdf|png|jpe?g)$/i.test(p) && !p.startsWith('/google'));
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

async function withPage(browser, fn) {
  const page = await browser.newPage();
  try { return await fn(page); } finally { await page.close(); }
}

async function crawl(browser, paths) {
  const targets = new Map(); // url -> [sources]
  const brokenImgs = [];
  const pageStatus = [];
  await pool(paths, 6, (path) => withPage(browser, async (page) => {
    await page.setViewport({ width: 1280, height: 900 });
    const resp = await page.goto(base + path, { waitUntil: 'load' });
    pageStatus.push({ path, status: resp.status() });
    const found = await page.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
      await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 5000); })));
      const urls = [...document.querySelectorAll('a[href],img[src],link[rel=stylesheet],script[src],iframe[src]')]
        .map((e) => e.href || e.src).filter(Boolean);
      const bad = [...document.images].filter((i) => i.currentSrc && i.naturalWidth === 0).map((i) => i.currentSrc);
      return { urls, bad };
    });
    for (const u of found.urls) {
      const url = new URL(u);
      if (url.origin !== new URL(base).origin) continue;
      url.hash = '';
      if (!targets.has(url.href)) targets.set(url.href, []);
      targets.get(url.href).push(path);
    }
    for (const b of found.bad) brokenImgs.push({ page: path, src: b });
  }));
  const broken = [];
  await pool([...targets.keys()], 12, async (u) => {
    const r = await fetch(u, { redirect: 'follow' });
    if (r.status !== 200) broken.push({ url: u, status: r.status, from: targets.get(u).slice(0, 3) });
  });
  const badPages = pageStatus.filter((p) => p.status !== 200);
  return { pages: paths.length, targets: targets.size, broken, brokenImgs, badPages };
}

// Runs in the page: contrast, overflow and dark-mode residue.
function pageAudit(theme) {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  function bgOf(el) {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (/url\(/.test(s.backgroundImage)) return null; // text over an image: not measurable
      const g = s.backgroundImage.match(/gradient\((?:[^,]*deg,|to [^,]*,)?\s*(rgba?\([^)]+\))/);
      if (g) { const c = parse(g[1]); if (c && c.a > 0.5) return c; }
      const c = parse(s.backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  }
  const issues = [];
  const de = document.documentElement;
  if (de.dataset.theme !== theme && !(theme === 'light' && !de.dataset.theme)) issues.push({ kind: 'theme', got: de.dataset.theme ?? null });
  if (de.scrollWidth > de.clientWidth) {
    const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed')
      .slice(0, 3).map((e) => e.tagName + '.' + [...e.classList].join('.'));
    issues.push({ kind: 'overflow', scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, wide });
  }
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const el = n.parentElement;
    if (!n.textContent.trim() || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('[aria-hidden=true],.sr-only,.screen-reader-text,[disabled],.disabled,svg,noscript,script,style')) continue;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (s.visibility === 'hidden' || +s.opacity === 0 || r.width === 0 || r.height === 0 || el.closest('[hidden]')) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const bg = bgOf(el); if (!bg) continue;
    const fg = parse(s.color); if (!fg) continue;
    const cr = ratio(blend(fg, bg), bg);
    const px = parseFloat(s.fontSize); const large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700);
    if (cr < (large ? 3 : 4.5)) issues.push({ kind: 'contrast', ratio: +cr.toFixed(2), el: el.tagName + '.' + [...el.classList].join('.'), text: n.textContent.trim().slice(0, 40) });
  }
  if (theme === 'dark') {
    for (const el of document.querySelectorAll('body *')) {
      if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE|svg|path)$/.test(el.tagName)) continue;
      const c = parse(getComputedStyle(el).backgroundColor);
      const r = el.getBoundingClientRect();
      // icon-sized marks (hamburger bars) are meant to be light in dark mode
      if (c && c.a > 0.5 && lum(c) > 0.5 && r.width * r.height > 400 && el.checkVisibility?.()) {
        issues.push({ kind: 'light-residue', el: el.tagName + '.' + [...el.classList].join('.'), bg: getComputedStyle(el).backgroundColor });
      }
    }
  }
  return issues;
}

async function audit(browser, paths) {
  const combos = paths.flatMap((p) => ['light', 'dark'].flatMap((t) => [1280, 375].map((w) => ({ p, t, w }))));
  const results = await pool(combos, 6, ({ p, t, w }) => withPage(browser, async (page) => {
    await page.evaluateOnNewDocument((t) => { try { localStorage.setItem('theme', t); localStorage.removeItem('preferredLanguage'); } catch {} }, t);
    await page.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + p, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 300));
    const issues = await page.evaluate(pageAudit, t);
    return issues.length ? { page: p, theme: t, width: w, issues } : null;
  }));
  return results.filter(Boolean);
}

async function shots(browser, dir) {
  mkdirSync(dir, { recursive: true });
  const combos = SHOT_PAGES.flatMap((p) => ['light', 'dark'].flatMap((t) => [1280, 390].map((w) => ({ p, t, w }))));
  await pool(combos, 4, ({ p, t, w }) => withPage(browser, async (page) => {
    await page.evaluateOnNewDocument((t) => { try { localStorage.setItem('theme', t); localStorage.removeItem('preferredLanguage'); } catch {} }, t);
    await page.setViewport({ width: w, height: 900, isMobile: w < 500, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + p, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));
    const name = (p.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home') + `-${t}-${w}.png`;
    await page.screenshot({ path: join(dir, name), fullPage: true });
  }));
  return combos.length;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const paths = await sitemapUrls();
  console.log(`${paths.length} sitemap pages`);
  if (cmd === 'crawl' || cmd === 'all') {
    const r = await crawl(browser, paths);
    writeFileSync(join(outDir, 'crawl.json'), JSON.stringify(r, null, 1));
    console.log(`crawl: ${r.pages} pages, ${r.targets} targets, ${r.broken.length} broken, ${r.brokenImgs.length} broken images, ${r.badPages.length} non-200 pages`);
  }
  if (cmd === 'audit' || cmd === 'all') {
    const r = await audit(browser, paths);
    writeFileSync(join(outDir, 'audit.json'), JSON.stringify(r, null, 1));
    const kinds = {}; r.forEach((x) => x.issues.forEach((i) => { kinds[i.kind] = (kinds[i.kind] || 0) + 1; }));
    console.log(`audit: ${r.length} page×theme×width combos with issues`, kinds);
  }
  if (cmd === 'shots' || cmd === 'all') console.log(`shots: ${await shots(browser, join(outDir, 'shots'))}`);
} finally {
  await browser.close();
}
