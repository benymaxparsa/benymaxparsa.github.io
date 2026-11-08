import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { firstImage } from './images.ts';

test('markdown image', () => {
  assert.deepEqual(firstImage('x ![bfs](/images/DFS-bfs.jpg) y'), { src: '/images/DFS-bfs.jpg', alt: 'bfs' });
});

test('html figure', () => {
  const line = '<figure class=""><a href="/images/AI.jpg" title="AI logo"><img src="/images/AI.jpg" loading="lazy" decoding="async" alt="AI logo"></a><figcaption>AI logo</figcaption></figure>';
  assert.deepEqual(firstImage(line), { src: '/images/AI.jpg', alt: 'AI logo' });
});

test('first wins', () => {
  assert.deepEqual(firstImage('<img alt="a" src="/a.png">\n\n![b](/b.png)'), { src: '/a.png', alt: 'a' });
});

test('picture element gives its img', () => {
  assert.deepEqual(firstImage('<picture><source srcset="/a.webp" type="image/webp"><img src="/a.jpg" alt="A"></picture>'), { src: '/a.jpg', alt: 'A' });
});

test('code fence ignored', () => {
  assert.equal(firstImage('```\n![x](/x.png)\n```\ntext'), null);
});

test('single-quoted attributes keep document order', () => {
  assert.deepEqual(firstImage("<img src='/a.png' alt='A'>\n![b](/b.png)"), { src: '/a.png', alt: 'A' });
});

test('tilde fence ignored', () => {
  assert.equal(firstImage('~~~\n![x](/x.png)\n~~~\ntext'), null);
});

test('url with parentheses', () => {
  assert.deepEqual(firstImage('![x](/images/a_(1).png)'), { src: '/images/a_(1).png', alt: 'x' });
});

test('local image preferred over remote', () => {
  assert.equal(firstImage('![a](https://x.org/a.png) ![b](/b.png)')?.src, '/b.png');
});

test('still image preferred over a remote GIF', () => {
  assert.equal(firstImage('![a](https://x.org/a.gif) ![b](https://x.org/b.jpg)')?.src, 'https://x.org/b.jpg');
});

test('none', () => {
  assert.equal(firstImage('no images'), null);
});

test('all projects have one', () => {
  const dir = new URL('../content/projects/', import.meta.url);
  for (const f of readdirSync(dir)) assert.notEqual(firstImage(readFileSync(new URL(f, dir), 'utf8')), null, f);
});
