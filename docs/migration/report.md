# Astro migration — verification report

Branch `astro-migration` (from `redesign-v3`), 2026-10-23. Astro 7.3.8, Node 24 in CI.
Baseline = the production Jekyll build of `redesign-v3` (commit 27b34a7), served locally
by `scripts/serve.mjs` with GitHub Pages resolution rules; the Astro build is served the same way.

## Done-criteria (plan §1)

| # | Criterion | Result |
|---|---|---|
| 1 | URL parity | **Pass.** 0 missing, 0 unexpected against the 497-path manifest. 206 theme internals dropped by design (Minimal Mistakes CSS/JS/fonts, `academicons-1.9.4/`, `banner.js`, gemspec, screenshots, `staticman.yml`, hidden `feed.xml`, `redirects.json`). Titles, language-twin links and redirect targets identical on every page. |
| 2 | Feature parity | **Pass.** `scripts/behaviour.mjs`: 41/41 (list below). |
| 3 | Links and images | **Pass.** 152 pages, 209 same-origin targets, 0 broken. 2 external images on `/projects/DA-Projects/` (raw.githubusercontent.com/HB-2000/…) are dead — they were dead on Jekyll too. |
| 4 | Contrast / dark mode / overflow | **Pass.** 152 pages × light/dark × 1280/375: 0 issues (Jekyll baseline had 48 contrast hits on the decorative `•` separators and a `/terms/` overflow; both gone). |
| 5 | Lighthouse | **Pass.** See below. |
| 6 | User approval on a preview | **Pass.** Approved 2026-10-23. |

Main-content text of every page was also diffed against Jekyll (`compare-urls.mjs … <jekyllSite>`): identical except the four intended changes listed below.

## Performance

| | Jekyll | Astro |
|---|---|---|
| Lighthouse mobile (perf / a11y / BP / SEO) | 80 / 100 / 96 / 100 | 85 / 100 / 100 / 100 |
| Lighthouse desktop | 100 / 100 / 96 / 100 | 100 / 100 / 100 / 100 |
| Lighthouse mobile CLS | 0.069 | 0 |
| Lighthouse desktop CLS | 0.03 | 0.006 |
| Home page bytes (Lighthouse) | 1485 KB | ~980 KB |
| Throttled home (4× CPU, Fast 4G, 390×844) LCP / CLS | 0.65 s / 0.003 | 0.86 s / 0.000 |

Best Practices went from 96 to 100 once the `X-Frame-Options`, `X-XSS-Protection` and `X-Content-Type-Options` `<meta>` tags were dropped: browsers only honour them as HTTP headers, which GitHub Pages can't set, so they protected nothing and logged a console error.
Throttled `/teaching/` LCP is 1.51 s (its LCP is a lazy award photo); the 1.0 s target was set for the home page.

## Behaviour checks (41/41)

Nav overflow menu (opens, Esc closes and returns focus, outside click closes); language switcher (accessible name contains EN/FR, links the real twin, click-only, Esc/outside close, stores the preference, `/` → `/fr/` when it is `fr`); search ("/" opens, results only in the page language, Esc closes and returns focus) in EN and FR; lightbox (modal, scroll lock, arrow keys, Esc, focus restored); theme toggle (attribute, storage, `theme-color`, applied before first paint on the next page); hero graph (reduced motion shows final state, converges, stops when settled, "New graph" < 16 ms, pauses offscreen); duration text correct for today; scroll-to-top and progress bar; external links (`_blank`, keeps `rel="me"`, adds `noopener noreferrer`, no ↗ on contact links, ↗ in body text); heading permalinks; CV preview selector; FR course materials; 404 status and search hint; `hreflang` alternates; skip link first in tab order; header at 16 widths × EN/FR with no overlap, clipping or overflow.

## Intended differences from the Jekyll site

- **French pages are fully French.** Jekyll printed "Updated:", "Share on", "Previous/Next" and English month names on FR pages; they now read "Mis à jour :", "Partager sur", "Précédent/Suivant", "1 septembre 2021".
- **Previous/Next stay in one language.** Jekyll's pager mixed EN and FR docs (Previous on an EN page often led to its French twin). Docs with no same-language neighbour (Industry has one) now show no pager.
- **`hreflang` now points at real twins.** Jekyll emitted `fr-CA` alternates like `/fr/publication/p6`, which don't exist.
- **`/sitemap/` page** lists the real pages and every collection; it no longer lists stylesheets, `robots.txt`, redirect stubs and untitled entries.
- **`/terms/`** lost its one-section table of contents (it was overflowing the page at 1280 px).
- **No security `<meta>` tags** (see Performance).
- **The image viewer's screen-reader name** is in French on French pages.
- **Footer** says "Powered by Astro".
- **Page descriptions** (`<meta name=description>`) for collection docs are the first paragraph of text, capped at 300 characters, instead of raw list markup.
- **Bold italic serif** text uses the real 700-weight italic (Google Fonts capped italic at 600 and the browser faked the bold), so it is a touch wider.
- **MathJax is gone** — no page uses math, and it was loading on every page.
- **Copy-code buttons are not ported** — the site has no code blocks.

## Bugs found and fixed on the way

- Hero graph never stopped animating (nodes pinned against the canvas edge kept their velocity). Also true on the Jekyll site. It now stops after 6–40 s.
- Header jumped ~6 px on phones when the nav script ran after first paint; it now lays out before first paint.
- Font-swap layout shift fixed with metric-matched fallback faces and preloads.
- Inline `code` showed light boxes in dark mode once kramdown's `highlighter-rouge` class went away.
- The YouTube embed on `/projects/AI-Projects/` overflowed at 375 px once FitVids went away (now CSS `aspect-ratio`).
- `{:target="_blank"}` kramdown attribute lists would have printed as text on `/publication/p1`.

## How it was checked (re-runnable)

```sh
npm run build && npm run preview                       # dist on :4321, GitHub Pages rules
node scripts/compare-urls.mjs dist docs/migration/url-manifest.json [jekyll _site]
node scripts/verify.mjs all http://localhost:4321 docs/migration/report
node scripts/behaviour.mjs http://localhost:4321
node scripts/perf.mjs http://localhost:4321 / 3
```

Screenshots: `docs/migration/baseline/shots/` (Jekyll) vs `docs/migration/report/shots/` (Astro); page heights match once lazy images have loaded.

## Needs your decision

Preview approved and security `<meta>` tags dropped (2026-10-23).

1. **Old template redirects** `/nmp*`, `/md/`, `/markdown.html`: they already 404 on the current site; not recreated.
2. **Cutover** (phase 8): switch Settings → Pages → Source to "GitHub Actions", then merge.
