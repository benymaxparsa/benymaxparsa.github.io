// Layout/style fingerprint of every sitemap page, to prove a CSS refactor changed nothing visible.
// Usage: node scripts/fingerprint.mjs <baseUrl> <out.json>   then diff two outputs with --diff a.json b.json
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'node:fs';

if (process.argv[2] === '--diff') {
  const [a, b] = process.argv.slice(3).map((f) => JSON.parse(readFileSync(f, 'utf8')));
  let diffs = 0;
  for (const k of Object.keys(a)) {
    const x = a[k], y = b[k] ?? [];
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      if (x[i] !== y[i]) { if (diffs++ < 40) console.log(`${k}\n  before: ${x[i]}\n  after:  ${y[i]}`); break; }
    }
  }
  console.log(`${diffs} page/mode combos differ`);
  process.exit(diffs ? 1 : 0);
}

const [base, out] = process.argv.slice(2);
const xml = await (await fetch(base + '/sitemap.xml')).text();
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((p) => !/\.pdf$/.test(p));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const result = {};
const jobs = paths.flatMap((p) => [['light', 1280], ['dark', 390]].map(([t, w]) => [p, t, w]));
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < jobs.length) {
    const [p, t, w] = jobs[i++];
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((t) => { localStorage.setItem('theme', t); localStorage.setItem('lastThreeImages', '[]'); Math.random = () => 0.42; }, t);
    await page.setViewport({ width: w, height: 900, isMobile: w < 500 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(base + p, { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
      await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); }))));
    });
    result[`${p} ${t} ${w}`] = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => !e.closest('svg,canvas')).map((e) => {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      return `${e.tagName}.${e.className} ${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)} ${s.color} ${s.backgroundColor} ${s.fontFamily.split(',')[0]} ${s.fontSize} ${s.fontWeight} ${s.borderTopColor} ${s.display} ${s.boxShadow.slice(0, 40)}`;
    }));
    await page.close();
  }
}));
await browser.close();
writeFileSync(out, JSON.stringify(result));
console.log(`${Object.keys(result).length} page/mode combos -> ${out}`);
