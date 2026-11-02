// Static files under public/, listed at build time (was site.static_files in Liquid).
import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

export interface StaticFile { path: string; name: string; basename: string; extname: string }

// Files directly in /dir/, sorted by name like Jekyll's `sort: "name"`
export function staticFiles(dir: string): StaticFile[] {
  let names: string[] = [];
  try { names = readdirSync(`public${dir}`); } catch { return []; }
  return names
    .filter((n) => !n.startsWith('.') && extname(n))
    .sort()
    .map((name) => ({ path: dir + name, name, basename: basename(name, extname(name)), extname: extname(name) }));
}

export const prettyName = (f: StaticFile) => f.basename.replace(/[_-]/g, ' ');

// A PDF's /CreationDate in ms since epoch, or Infinity if missing (sorts last).
// shortcut: only finds an uncompressed Info dict (LaTeX output); a PDF whose Info sits in a compressed object stream sorts last.
export function pdfCreated(f: StaticFile): number {
  if (f.extname.toLowerCase() !== '.pdf') return Infinity;
  const m = [...readFileSync(`public${f.path}`, 'latin1').matchAll(/\/CreationDate\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:([+-])(\d{2})'?(\d{2}))?/g)].pop();
  if (!m) return Infinity;
  const [, y, mo, d, h, mi, s, sign, oh, om] = m;
  const offset = sign ? (sign === '-' ? -1 : 1) * (+oh * 60 + +om) : 0;
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s) - offset * 60_000;
}
