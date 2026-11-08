// node --test scripts/cards.test.mjs   (Node type-stripping runs the .ts source directly)
import test from 'node:test';
import assert from 'node:assert/strict';
import { foldBullets, slideshow } from '../src/lib/cards.ts';

const li = (t) => `<li>${t}</li>`;
const link = (t) => `<li><a href="https://x.test">${t}</a></li>`;

test('foldBullets: keeps two text bullets, folds the rest, leaves link bullets visible', () => {
  const html = `<ul>${[li('a'), li('b'), li('c'), li('d'), link('Website')].join('\n')}</ul>`;
  const out = foldBullets(html, 'More');
  assert.match(out, /^<ul><li>a<\/li>\n<li>b<\/li><\/ul><details class="more"><summary>More<\/summary><ul><li>c<\/li>\n<li>d<\/li><\/ul><\/details><ul><li><a href/);
});

test('foldBullets: short lists, nested lists and no list are untouched', () => {
  const three = `<ul>${[li('a'), li('b'), li('c')].join('')}</ul>`;
  assert.equal(foldBullets(three, 'More'), three);
  const nested = `<ul><li>a<ul><li>x</li></ul></li><li>b</li><li>c</li><li>d</li></ul>`;
  assert.equal(foldBullets(nested, 'More'), nested);
  assert.equal(foldBullets('<p>hi</p>', 'More'), '<p>hi</p>');
});

test('slideshow: a gallery figure with two images gets slides, controls and dots; a single image is untouched', () => {
  const two = '<figure class="half"><a href="/a.jpg"><img src="/a.jpg"></a><a href="/b.jpg"><img src="/b.jpg"></a><figcaption>c</figcaption></figure>';
  const out = slideshow(two, 'Prev', 'Next');
  assert.match(out, /^<figure class="half is-slides"><a class="is-active" href="\/a\.jpg">/);
  assert.equal((out.match(/<span><\/span>|<span class="is-on"><\/span>/g) ?? []).length, 2); // one dot per image
  assert.match(out, /aria-label="Prev"/);
  const one = '<figure class="half"><a href="/a.jpg"><img src="/a.jpg"></a></figure>';
  assert.equal(slideshow(one, 'Prev', 'Next'), one);
});
