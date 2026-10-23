// Phase 2: strip Jekyll/kramdown-isms from Markdown so Astro renders the same HTML.
// Idempotent. Usage: node scripts/convert-content.mjs src/content src/pages
// shortcut: uses the transitive `yaml` package; fine for a one-off migration script.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// github-slugger's rule, so these ids match the ones Astro gives other headings
const slug = (s) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s/g, '-');

// Same markup as _includes/gallery, without the whitespace that would split the HTML block.
function gallery(items = [], caption) {
  const layout = items.length === 2 ? 'half' : items.length >= 3 ? 'third' : '';
  const imgs = items.map((g) => {
    const img = `<img src="${esc(g.image_path)}" loading="lazy" decoding="async" alt="${esc(g.alt ?? '')}">`;
    return g.url ? `<a href="${esc(g.url)}"${g.title ? ` title="${esc(g.title)}"` : ''}>${img}</a>` : img;
  });
  return `\n<figure class="${layout}">${imgs.join('')}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>\n`;
}

const report = { changed: [], unhandled: [] };
for (const root of process.argv.slice(2)) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    const fm = m ? parse(m[1]) ?? {} : {};
    let body = m ? src.slice(m[0].length) : src;

    body = body
      .replace(/<!--[\s\S]*?-->/g, (c) => (/\{%|\{\{/.test(c) ? '' : c))
      .replace(/^[ \t]*\{% include base_path %\}[ \t]*\r?\n?/gm, '')
      .replace(/\{\{ base_path \}\}/g, '')
      .replace(/\{% include gallery(?: id="(\w+)")?(?: caption="([^"]*)")? %\}/g, (_, id, cap) => gallery(fm[id ?? 'gallery'], cap))
      .replace(/^(#{1,6}) (.+)\r?\n\{:((?: \.[\w-]+)+)\}[ \t]*$/gm, (_, h, text, cls) =>
        `<h${h.length} id="${slug(text)}" class="${cls.trim().replace(/\./g, '')}">${text}</h${h.length}>`)
      .replace(/ markdown="1"/g, '')
      // span IALs after links ({:target="_blank"}): the site script already opens external links in a new tab
      .replace(/(\))\{:[^}\n]*\}/g, '$1');

    const out = (m ? m[0] : '') + body;
    if (out !== src) { writeFileSync(file, out); report.changed.push(file); }
    const left = body.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /\{%|\{\{|\{:/.test(l));
    for (const [n, l] of left) report.unhandled.push(`${file}:${n}: ${l.trim()}`);
  }
}

console.log(`changed ${report.changed.length} files`);
if (report.unhandled.length) {
  console.error(`unhandled Liquid/IAL (${report.unhandled.length}):\n` + report.unhandled.join('\n'));
  process.exit(1);
}
