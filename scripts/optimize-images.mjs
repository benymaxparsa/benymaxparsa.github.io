// Post-build step: every local raster <img> in dist/ gets width/height (no layout shift) and a
// WebP srcset (480/960/1600 px). Originals stay put, since lightbox links and downloads use them.
// Markdown bodies hold raw <img> HTML, so this works on the built pages instead of in the content.
import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, stat, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const WIDTHS = [480, 960, 1600];
const SIZES = '(max-width: 760px) 100vw, 704px';
const IMG_SRC = /\ssrc="(\/images\/[^"]+\.(?:jpe?g|png))"/i;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

// src -> { width, height, srcset } | null, computed once per image
const cache = new Map();
async function describe(src) {
  if (cache.has(src)) return cache.get(src);
  const rel = decodeURIComponent(src);
  const file = join(DIST, rel);
  const job = (async () => {
    let meta, bytes;
    try { [meta, bytes] = [await sharp(file).metadata(), (await stat(file)).size]; } catch { return null; }
    const info = { width: meta.width, height: meta.height, srcset: '' };
    const parts = [];
    await mkdir(dirname(join(DIST, `/images/_w${rel.slice('/images'.length)}`)), { recursive: true });
    for (const w of WIDTHS.filter((w) => w < meta.width)) {
      const outRel = `/images/_w${rel.slice('/images'.length)}.${w}.webp`;
      const out = join(DIST, outRel);
      const { size } = await sharp(file).resize({ width: w }).webp({ quality: 78, effort: 4 }).toFile(out);
      if (size < bytes) parts.push(`${encodeURI(outRel)} ${w}w`);
      else await unlink(out);
    }
    // Smaller than the original at full size too, or the srcset would make things worse
    const full = `/images/_w${rel.slice('/images'.length)}.${meta.width}.webp`;
    const { size } = await sharp(file).webp({ quality: 78, effort: 4 }).toFile(join(DIST, full));
    if (size < bytes) parts.push(`${encodeURI(full)} ${meta.width}w`);
    else await unlink(join(DIST, full));
    if (parts.length) info.srcset = parts.join(', ');
    return info;
  })();
  cache.set(src, job);
  return job;
}

let pages = 0, imgs = 0;
for await (const file of walk(DIST)) {
  const html = await readFile(file, 'utf8');
  const tags = [...new Set(html.match(/<img\b[^>]*>/g) ?? [])];
  let out = html;
  for (const tag of tags) {
    const m = tag.match(IMG_SRC);
    if (!m || /\ssrcset=/.test(tag)) continue;
    const info = await describe(m[1]);
    if (!info) { console.warn(`optimize-images: skipped ${m[1]} (not found in ${DIST}) on ${file}`); continue; }
    let next = tag;
    if (!/\swidth=/.test(next)) next = next.replace(/^<img/, `<img width="${info.width}" height="${info.height}"`);
    if (info.srcset) next = next.replace(/^<img/, `<img srcset="${info.srcset}" sizes="${SIZES}"`);
    out = out.split(tag).join(next);
    imgs++;
  }
  if (out !== html) { await writeFile(file, out); pages++; }
}
console.log(`optimize-images: ${imgs} <img> tags updated on ${pages} pages, ${cache.size} source images`);
