// Phase 0: record every output path of a built site as the URL contract.
// Usage: node scripts/url-manifest.mjs <siteDir> <out.json>
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';

const [siteDir = '_site', out = 'docs/migration/url-manifest.json'] = process.argv.slice(2);

const TYPES = {
  '.html': 'text/html', '.xml': 'application/xml', '.json': 'application/json',
  '.txt': 'text/plain', '.css': 'text/css', '.js': 'text/javascript', '.pdf': 'application/pdf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const attr = (html, re) => (html.match(re) || [])[1] ?? null;

const entries = [];
for (const file of walk(siteDir)) {
  const path = '/' + relative(siteDir, file).split('\\').join('/');
  const ext = extname(path).toLowerCase();
  const e = { path, type: TYPES[ext] ?? 'application/octet-stream', size: statSync(file).size };
  if (ext === '.html') {
    const html = readFileSync(file, 'utf8');
    e.title = attr(html, /<title>([^<]*)<\/title>/i)?.trim() ?? null;
    e.lang = attr(html, /<html[^>]*\blang="([^"]+)"/i);
    e.twin = attr(html, /href="([^"]+)"[^>]*class="lang-option/i);
    e.redirect = attr(html, /http-equiv="refresh" content="0; url=(?:https?:\/\/[^/]+)?([^"]+)"/i);
  }
  entries.push(e);
}
entries.sort((a, b) => a.path.localeCompare(b.path));

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(entries, null, 1) + '\n');
console.log(`${entries.length} paths (${entries.filter((e) => e.type === 'text/html').length} html) -> ${out}`);
