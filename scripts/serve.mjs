// Static server with GitHub Pages resolution rules, so Jekyll's _site and Astro's
// dist are previewed and audited the same way.
// Usage: node scripts/serve.mjs <dir> [port]
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const [root = 'dist', port = '4321'] = process.argv.slice(2);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.xml': 'application/xml', '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.pdf': 'application/pdf', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json', '.wasm': 'application/wasm',
};

const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

function send(res, file, status = 200) {
  res.writeHead(status, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const abs = join(root, path);
  if (!path.endsWith('/') && isFile(abs)) return send(res, abs);
  if (isFile(join(abs, 'index.html'))) {
    if (!path.endsWith('/')) {
      res.writeHead(301, { location: url.pathname + '/' + url.search });
      return res.end();
    }
    return send(res, join(abs, 'index.html'));
  }
  if (isFile(abs + '.html')) return send(res, abs + '.html');
  const notFound = join(root, '404.html');
  if (isFile(notFound)) return send(res, notFound, 404);
  res.writeHead(404).end('not found');
}).listen(Number(port), () => console.log(`serving ${root} on http://localhost:${port}`));
