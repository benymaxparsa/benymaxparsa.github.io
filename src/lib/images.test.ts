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

test('none', () => {
  assert.equal(firstImage('no images'), null);
});

test('all projects have one', () => {
  const dir = new URL('../content/projects/', import.meta.url);
  for (const f of readdirSync(dir)) assert.notEqual(firstImage(readFileSync(new URL(f, dir), 'utf8')), null, f);
});
