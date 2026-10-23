// Static files under public/, listed at build time (was site.static_files in Liquid).
import { readdirSync } from 'node:fs';
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
