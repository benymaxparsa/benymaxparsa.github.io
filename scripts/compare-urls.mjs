// Phase 3/6 gate: diff a build against the Jekyll URL manifest.
// Usage: node scripts/compare-urls.mjs <distDir> <manifest.json> [jekyllSiteDir]
// With jekyllSiteDir it also diffs the visible text of every page's main content.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [dist = 'dist', manifestPath = 'docs/migration/url-manifest.json', jekyllDir] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// Jekyll outputs that are theme or repo internals, deliberately not carried over
const DROPPED = [
  /^\/academicons-1\.9\.4\//, /^\/assets\/(css|js|fonts)\//, /^\/banner\.js$/, /^\/minimal-mistakes-jekyll\.gemspec$/,
  /^\/screenshot(-layouts)?\.png$/, /^\/staticman\.yml$/, /^\/feed\.xml$/, /^\/redirects\.json$/,
];
// Build outputs that are new and expected
const ADDED = [/^\/_astro\//, /^\/pagefind\//, /\/\.DS_Store$/]; // .DS_Store: local Finder files, never in git

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const built = new Map([...walk(dist)].map((f) => ['/' + relative(dist, f).split('\\').join('/'), f]));
const expected = new Map(manifest.map((e) => [e.path, e]));

const missing = [...expected.keys()].filter((p) => !built.has(p) && !DROPPED.some((r) => r.test(p)));
const unexpected = [...built.keys()].filter((p) => !expected.has(p) && !ADDED.some((r) => r.test(p)));
const dropped = [...expected.keys()].filter((p) => !built.has(p) && DROPPED.some((r) => r.test(p)));

const attr = (html, re) => (html.match(re) || [])[1] ?? null;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;|&#160;/g, ' ');
const mismatches = [];
for (const [path, e] of expected) {
  if (e.type !== 'text/html' || !built.has(path)) continue;
  const html = readFileSync(built.get(path), 'utf8');
  if (e.redirect) {
    const to = attr(html, /http-equiv="refresh" content="0;\s*url=([^"]+)"/i);
    if (to !== e.redirect) mismatches.push({ path, field: 'redirect', want: e.redirect, got: to });
    continue;
  }
  const title = attr(html, /<title>([^<]*)<\/title>/i);
  if (title && e.title && decode(title).trim() !== decode(e.title).trim()) mismatches.push({ path, field: 'title', want: e.title, got: title });
  const twin = attr(html, /href="([^"]+)"[^>]*class="lang-option/i);
  if (e.twin !== twin) mismatches.push({ path, field: 'twin', want: e.twin, got: twin });
}

// Visible text of the main content, Jekyll vs Astro
const textDiffs = [];
const FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
if (jekyllDir) {
  const mainText = (html) => {
    const start = html.indexOf('<div id="main"');
    const end = html.indexOf('<div class="search-content"');
    if (start < 0) return null;
    return decode(html.slice(start, end > start ? end : undefined)
      .replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' '))
      .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  };
  for (const [path, e] of expected) {
    if (e.type !== 'text/html' || e.redirect || !built.has(path)) continue;
    // Intended change: FR pages now show French chrome and dates (Jekyll printed English ones)
    const norm = (t) => t
      ?.replace(/Mis à jour :/g, 'Updated:').replace(/Partager sur/g, 'Share on').replace(/Précédent/g, 'Previous').replace(/Suivant/g, 'Next')
      .replace(/\b(\d{1,2}) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) (\d{4})/g, (_, d, m, y) => `${EN[FR.indexOf(m)]} ${d}, ${y}`)
      .replace(/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) (\d{4})/g, (_, m, y) => `${EN[FR.indexOf(m)]} ${y}`);
    const a = norm(mainText(readFileSync(join(jekyllDir, path), 'utf8')));
    const b = norm(mainText(readFileSync(built.get(path), 'utf8')));
    if (a === null || a === b) continue;
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    textDiffs.push({ path, at: i, jekyll: a.slice(Math.max(0, i - 40), i + 80), astro: (b ?? '').slice(Math.max(0, i - 40), i + 80) });
  }
}

console.log(`built ${built.size} files; manifest ${expected.size}; dropped by design ${dropped.length}`);
console.log(`missing: ${missing.length}`); missing.forEach((p) => console.log('  - ' + p));
console.log(`unexpected: ${unexpected.length}`); unexpected.forEach((p) => console.log('  + ' + p));
console.log(`field mismatches: ${mismatches.length}`); mismatches.forEach((m) => console.log(`  ${m.path} ${m.field}: want ${JSON.stringify(m.want)} got ${JSON.stringify(m.got)}`));
if (jekyllDir) {
  console.log(`main-text differences: ${textDiffs.length}`);
  textDiffs.forEach((d) => console.log(`  ${d.path} @${d.at}\n    jekyll: …${d.jekyll}…\n    astro:  …${d.astro}…`));
}
process.exitCode = missing.length || unexpected.length || mismatches.length ? 1 : 0;
