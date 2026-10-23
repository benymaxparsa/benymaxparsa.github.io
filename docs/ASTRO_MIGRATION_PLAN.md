# Astro migration plan — benymaxparsa.github.io

Execution plan for moving this site from Jekyll 3.9 + Minimal Mistakes to Astro.
Written 2026-10-23 for the agent that will carry it out. Lives in `docs/`, which
`_config.yml` excludes, so Jekyll never publishes it.

Read the whole plan before starting. Phases are ordered so the site stays
deployable on `master` until the cutover in phase 8; all work happens on a branch.

---

## 1. Goal, scope, done-criteria

**Goal.** Same site, same URLs, same design (the Oct 2026 "graph-paper notebook"
v3 system), rebuilt on Astro with no jQuery, no Ruby, no theme to fight.

**Why (concrete pain, observed in the Oct 2026 sessions):**
- Ruby Sass 3.7 (discontinued) cannot parse modern CSS (`clamp()` needed `unquote()`).
- Minimal Mistakes compiles colours at build time; dark mode required re-pointing
  every theme surface at CSS tokens by hand.
- Header nav = jQuery greedy-nav in a hand-patched `assets/js/main.min.js`.
- Bilingual support is filename conventions + Liquid string-replace fallbacks.

**Out of scope:** content rewrites, a new visual design, a CMS, any client
framework (no React/Vue/Svelte). The hero graph stays vanilla JS/TS.

**Done when all of these hold (each has a check in §6):**
1. URL parity: every URL in the baseline manifest returns 200 with the same
   content type, or is a deliberate redirect listed in §5.4. No new 404s.
2. Feature parity: every feature in §3.4 works, verified in a browser.
3. 0 broken internal links/images across the sitemap (crawl in §6).
4. WCAG AA contrast clean in light and dark at 1280 and 375 px; no horizontal overflow.
5. Lighthouse mobile: Accessibility 100, SEO 100, Best Practices ≥ 96.
   Throttled (4× CPU, Fast 4G) LCP ≤ 1.0 s, CLS ≤ 0.03 (baseline: 0.88 s / 0.026).
6. The user has seen it on a preview deploy and approved the cutover.

---

## 2. Decisions (made — don't relitigate without a reason found in the code)

| Topic | Decision | Reason |
|---|---|---|
| Framework | Astro, latest stable at execution time; pin the exact version in `package.json` | Content-first, zero JS by default, built-in i18n and content collections |
| Content | Keep Markdown; `.md` stays `.md`. MDX only where a file needs a component | Content portable, minimal churn |
| Collections | Astro content collections with Zod schemas, one per Jekyll collection | Typed front matter catches drift between EN/FR twins |
| i18n | Do NOT switch to Astro's `i18n` routing for collection docs; keep explicit per-doc permalinks | Current FR URLs are irregular (see §3.2); routing must reproduce them exactly |
| URL format | `build.format: 'preserve'` + `trailingSlash: 'ignore'` | Site mixes `/teaching/x/`-style and `/publication/p6` (no slash, served from `p6.html`) |
| CSS | Port `assets/css/main.scss` tokens + components into plain CSS (or Astro-scoped CSS); delete everything Minimal-Mistakes-specific | Kills the compile-time-colour problem |
| Fonts | Self-host Schibsted Grotesk + Source Serif 4 via Fontsource with `font-display: swap` and size-adjusted fallbacks | Removes the Google Fonts round trip and the remaining 0.025 CLS from font swap |
| Icons | Replace Font Awesome 5 CDN + academicons with inline SVG (astro-icon or hand-picked SVGs) | ~25 icons used; drop a render-path CDN dependency |
| Search | Pagefind, filtered by `lang` | Static, no index shipped on every page; replaces lunr + the 108 KB ui-text |
| Lightbox | Native `<dialog>` component | Replaces Magnific Popup + jQuery |
| Hosting | GitHub Pages via GitHub Actions (`withastro/action` + `actions/deploy-pages`) | Same domain; needs one settings change by the user (§7) |

---

## 3. Current-state inventory (measured 2026-10-23)

### 3.1 Build stack
- `Gemfile`: `github-pages`, `jekyll-redirect-from`, `jekyll-feed`, `jekyll-sitemap`, `hawkins`.
- Plugins in `_config.yml`: paginate, sitemap, gist, feed (hidden), include-cache, redirect-from, jemoji.
- Theme: Minimal Mistakes 4.24 vendored in `_sass/`, `_layouts/`, `_includes/`, skin `default`.
- `_config.yml` `exclude` hides repo notes, sample `_posts`, and template pages (added Oct 2026). Those are NOT part of the site and must not be ported.

### 3.2 Content (the part that must survive intact)

| Collection | Docs | FR twins | EN permalink pattern | FR permalink pattern |
|---|---|---|---|---|
| `_teaching` | 62 | 31 | `/teaching/<slug>` | `/fr/enseignement/<slug>` |
| `_projects` | 26 | 13 | none → `/projects/<file>/` | none → `/projects/<file>-fr/` (!) |
| `_extracurricular` | 10 | 5 | `/extracurricular/<slug>` | `/fr/activites/<slug>` |
| `_publications` | 8 | 4 | `/publication/<slug>` (singular, no slash) | `/fr/publications/<slug>` |
| `_research` | 6 | 3 | `/research/<slug>` | `/fr/recherche/<slug>` |
| `_education` | 4 | 2 | `/education/<slug>` | `/fr/formation/<slug>` |
| `_industry` | 2 | 1 | `/industry/<slug>` | `/fr/experiences/<slug>` |

- Twin rule: `X.md` ↔ `X-fr.md` in the same folder. Every FR doc has `lang: fr-CA`
  (verified: 59/59). EN docs have no `lang`.
- Front matter keys in collections: `title, date, venue, collection` (all 118),
  `type, location` (110), `permalink` (92), `lang` (59), `gallery` (40),
  `paperurl, citation` (8), `rel, erd` (2).
- **Do not infer URLs from these patterns.** Phase 0 records the real URL of every
  document from the built `_site`; that manifest is the contract.

### 3.3 Pages and Jekyll-isms that need conversion
- 46 files in `_pages/` (EN + `_pages/fr/`), 25 of them `.html` Liquid pages
  (collection listings, CV viewer, teaching timeline, course materials).
- Liquid inside content: 72 files. Biggest groups:
  - `{% include gallery %}` ×51 → render `gallery` front matter in the layout; delete the include line.
  - `{% include base_path %}` ×27 → delete.
  - `{% for post in … %}` + `{% include archive-single.html %}` ×22 → `.astro` listing pages.
  - `{% if post.lang %}` / `{% unless post.lang %}` → filter by `lang` in the collection query.
  - Homepage: `{% include home-photo.html %}`, `{% include profile-links.html %}` → components.
- kramdown-only syntax in 8 files: IALs (`{: .section-heading}`, `{: .notice}`,
  `{: .btn …}`, `{:target="_blank"}`) and `markdown="1"` blocks (news pages).
  Convert IALs to plain HTML elements with classes (script, §5.2).
  Move news into a `news` collection (one file per item, `date` + body), which
  also removes the `markdown="1"` problem and powers the homepage list.
- `redirect_from` (11 aliases): `/about/`, `/about.html`, `/fr/a-propos/`,
  `/fr/accueil/`, `/resume`, `/fr/resume`, `/nmp/`, `/nmp.html`, `/md/`,
  `/markdown.html`, `/wordpress/blog-posts/`. Keep all that resolve to live pages
  (Astro `redirects`). `/nmp*`, `/md/` and `/markdown.html` belonged to excluded
  template pages — keep them only if the user wants, otherwise let them 404.
- `_data/`: `navigation.yml` (EN/FR menus), `language_urls.yml` (page pairs),
  `course_materials.yml` (teaching materials list), `ui-text.yml` (108 KB theme
  strings; only a handful used — replace with a small `src/i18n.ts`).
- Must stay byte-identical in `public/`: `files/` (CV PDFs, course PDFs),
  `images/`, `assets/favicon/`, `manifest.json`, `googlef74902c0964df8f1.html`
  (Search Console verification — losing it breaks Search Console ownership).

### 3.4 Feature checklist (port each; each is a test in §6)
From `assets/js/custom-enhancements.js` and includes:
1. Theme toggle: system default, saved choice in `localStorage.theme`, applied by an
   inline `<head>` script before paint, `themechange` event, `theme-color` meta update.
2. Hero graph (`addHeroGraph`): planted-partition graph K=4, PER=14, P_IN=0.5,
   P_OUT=0.012, force layout, async LPA, palette per theme, pauses offscreen
   (IntersectionObserver), stops when settled, reduced-motion = draw final state,
   status text reserved at two lines (CLS fix), "New graph" button.
3. Rotating homepage photo: 9 photos in `images/Profile_Pictures/sm/`, never the
   last three seen (`localStorage.lastThreeImages`), `fetchpriority=high`, reserved box.
4. Header nav with overflow menu: primary items first, overflow into a menu;
   `aria-expanded`, Esc and outside-click close, focus returns to the toggle.
   Reimplement with ResizeObserver; no jQuery.
5. Language switcher: click-only (never hover-open), Esc/outside close, accessible
   name contains the visible "EN"/"FR", links each page to its real twin
   (collection twins + `language_urls.yml`), stores `preferredLanguage`;
   `/` redirects to `/fr/` when the preference is `fr`.
6. Search: "/" shortcut, Esc closes and returns focus, results only in the page language.
7. Lightbox for award photos and galleries: arrow keys, Esc, scroll lock released on close.
8. External links: `target=_blank`, `rel` gains `noopener noreferrer` but keeps
   existing values (`rel="me"`), ↗ marker with empty alt text, not on profile links,
   footer or buttons.
9. Durations `.teaching-duration[data-start][data-end]` → "X yrs Y mos" / "X ans Y mois".
10. Reading-progress bar, scroll-to-top button, copy-code buttons, skip links.
11. CV page: inline PDF viewer + EN/FR download buttons.
12. Course materials page (EN `/teaching/materials/`, FR `/fr/enseignement/materiel/`).
13. 404 page (EN + FR) with search hint.
14. Google Analytics gtag `G-YZHKJ874X8`, Open Graph/Twitter meta, sitemap.xml.
    Add `hreflang` alternates — new, cheap, improves bilingual SEO.

---

## 4. Target structure

```
astro.config.mjs        # site, build.format 'preserve', trailingSlash 'ignore', redirects, sitemap
src/
  content.config.ts     # Zod schemas for teaching, projects, publications, research,
                        # education, industry, extracurricular, news
  content/<collection>/ # moved .md files, filenames unchanged (X.md, X-fr.md)
  i18n.ts               # UI strings EN/FR (nav labels, aria labels, dates)
  lib/urls.ts           # permalink + twin resolution (single source for routes & switcher)
  layouts/Base.astro    # head (theme script, meta, hreflang), header, footer
  layouts/Doc.astro     # collection document: title, meta, gallery, citation
  components/           # Header, NavOverflow, LanguageSwitcher, ThemeToggle,
                        # HeroGraph, HomePhoto, ProfileLinks, Gallery, Lightbox,
                        # NewsList, Stats, CvViewer, Search
  pages/                # one .astro per current page (EN + fr/), plus
                        # [...slug].astro routes that emit each doc at its manifest URL
  scripts/              # graph.ts, theme.ts, nav.ts, enhancements.ts (ported, typed)
  styles/               # tokens.css (light/dark), base.css, components.css
public/                 # files/, images/, assets/favicon/, manifest.json, google*.html
scripts/
  url-manifest.mjs      # phase 0: list every output path of the Jekyll _site
  compare-urls.mjs      # phase 6: diff Astro dist against the manifest
  convert-content.mjs   # phase 2: strip Liquid, convert IALs, split news
```

Routing rule: each doc's output path comes from `lib/urls.ts`, which reads the
doc's `permalink` front matter when present and otherwise applies the Jekyll
default `/:collection/:path/`. Do not hand-maintain a route list.

---

## 5. Phases

Each phase ends with a commit on the `astro-migration` branch and its exit check.
Never commit to `master` before phase 8. Commit messages follow the user's global
rule: no AI co-author or attribution trailers.

### Phase 0 — Baseline (no code changes to the site)
1. `git switch -c astro-migration` from `master`.
2. `bundle exec jekyll build`. Run `scripts/url-manifest.mjs` over `_site/` →
   `docs/migration/url-manifest.json` (path, content type, size, `<title>`, `lang`, twin link).
3. Save baseline evidence in `docs/migration/baseline/`: Lighthouse JSON (mobile +
   desktop, home), the link crawl, contrast/overflow audit output, and screenshots
   of home, teaching, publications, one project, CV and contact in light and dark at 1280 and 390.
   The audit scripts from the Oct 2026 session are reproduced in §6; reuse them.

**Exit:** manifest committed and its count matches the Jekyll sitemap plus
assets/files; baseline audit is clean (it was on 2026-10-23).

### Phase 1 — Scaffold
1. Create the Astro project at the repo root alongside Jekyll (Astro uses `src/`,
   `public/`, `astro.config.mjs`; Jekyll ignores them once added to `exclude`).
2. Add `@astrojs/sitemap`, Pagefind, Fontsource packages. No UI framework integrations.
3. Port tokens to `src/styles/tokens.css`. Keep the light-default/dark-override
   structure: `:root` light, `:root[data-theme=dark]` and
   `@media (prefers-color-scheme: dark) :root:not([data-theme=light])` dark.
4. `Base.astro` with the inline theme script copied verbatim from `_includes/head.html`.

**Exit:** `npm run build` and `npm run preview` show an empty styled page; theme
toggle works with no flash on reload.

### Phase 2 — Content
1. `git mv` each `_<collection>/` into `src/content/<collection>/`, filenames unchanged.
2. Run `scripts/convert-content.mjs` (idempotent, prints a diff summary):
   - delete `{% include base_path %}` and `{% include gallery %}` lines;
   - convert IAL lines to HTML (`## Foo\n{: .section-heading}` → `<h2 class="section-heading">Foo</h2>`);
   - fail loudly on any other remaining `{%` or `{{` and list the files.
3. Write Zod schemas from the key counts in §3.2. `lang` defaults to `en`. Make
   `gallery` an array of `{url, image_path, alt?, title?}`.
4. Split `_pages/news.md` and `_pages/fr/news.md` into `src/content/news/` items.

**Exit:** `astro check` passes; schema validation passes for all 118 docs; the
converter reports zero unhandled Liquid.

### Phase 3 — Routes and pages
1. `lib/urls.ts`: permalink resolution and twin lookup (`X.md` ↔ `X-fr.md`).
   Unit-test it against `url-manifest.json`: every doc maps to its manifest URL.
2. Dynamic routes emit each doc at its exact URL, including slashless ones
   (`/publication/p6` → `publication/p6.html`).
3. Port the 46 pages: listings become collection queries filtered by `lang`;
   the CV, teaching timeline, course materials, honors, contact and 404 keep their markup.
4. Redirects from §3.3 go in `astro.config.mjs`.

**Exit:** `compare-urls.mjs` reports 0 missing and 0 unexpected paths, apart from
the redirect allow-list.

### Phase 4 — Components and behaviour
Port §3.4 items 1–13 as components and typed scripts. Load scripts with Astro's
bundled `<script>` (deferred, deduplicated). No inline `onclick`.
- Hero graph: port the logic as-is and keep the reduced-motion and offscreen paths.
- Nav overflow: measure with ResizeObserver; recompute after `document.fonts.ready`.
- Lightbox: `<dialog>` with focus trap from the native modal; restore focus on close.
- Search: Pagefind UI or custom markup; index only `<main>`; filter by
  `data-pagefind-filter="lang"`.

**Exit:** each §3.4 item passes its browser check (§6, step 4).

### Phase 5 — SEO and metadata
Port the titles/descriptions/OG/Twitter tags from `_includes/seo.html` and add
`hreflang` alternates from the twin map. Keep sitemap URLs identical to the
manifest. Keep gtag. Copy the Search Console verification file. Leave out the
`X-Frame-Options`/`X-XSS-Protection` meta tags; they are ignored in `<meta>` and
log a console error. Confirm with the user first, since that removal was blocked once as "security".

**Exit:** Lighthouse SEO 100 and Best Practices ≥ 96 on preview.

### Phase 6 — Verification (do not skip; this is what makes it "done")
Run every step of §6. Fix and re-run until all pass. Record results in
`docs/migration/report.md`.

### Phase 7 — Preview deploy
1. Add `.github/workflows/deploy.yml` (build with Node LTS, run Pagefind, upload, deploy).
2. Deploy the branch to a preview: a fork, or a temporary Pages environment (ask the user which).
3. Give the user the preview URL and the report.

**Exit:** the user approves.

### Phase 8 — Cutover (only with explicit user go-ahead)
1. Tag the last Jekyll commit `jekyll-final` (the rollback point).
2. The user switches Settings → Pages → Source to "GitHub Actions". This can't be done from the repo.
3. Merge `astro-migration` into `master`; remove Jekyll files (`_config.yml`, `Gemfile*`, `_sass/`, `_layouts/`, `_includes/`, `assets/js/main.min.js`, lunr) in the same PR.
4. After deploy, re-run the §6 crawl against the live domain.

**Rollback:** revert the merge and switch the Pages source back to the branch. The `jekyll-final` tag restores the old site exactly.

---

## 6. Verification suite

Run against `npm run preview` (and against the live site after cutover).

1. **URL parity:** `node scripts/compare-urls.mjs dist docs/migration/url-manifest.json`
   → 0 missing, 0 unexpected (except the redirect allow-list).
2. **Link + image crawl:** for every sitemap URL, parse `a[href]`, `img[src]`,
   `link[rel=stylesheet]`, `script[src]`, `iframe[src]`; fetch each same-origin
   target; expect 200. Then load each page in an iframe with lazy images forced
   eager and check `img.naturalWidth > 0`. (Oct 2026 result on Jekyll: 0 broken
   across 154 pages / 228 targets.)
3. **Theme + contrast + overflow:** for each sitemap URL × {light, dark} × {1280, 375}:
   set `localStorage.theme`; load in a sandboxed same-origin iframe; assert
   `html[data-theme]`; `scrollWidth ≤ clientWidth`; and for every visible text node,
   contrast against the first opaque ancestor background (count `linear-gradient`
   first stops as backgrounds) ≥ 4.5 (≥ 3 for large text). In dark mode, flag any
   element whose background is one of the light palette values. Disabled pager
   items are exempt.
4. **Behaviour (real clicks and keys via DevTools):** the §3.4 list. Specifically:
   menu open → Esc closes with focus on the toggle and `aria-expanded=false`; outside
   click closes; language dropdown Esc and outside close; "/" opens search and the
   results match the page language; lightbox arrow keys and Esc; theme toggle
   persists across navigation with no flash; the graph pauses offscreen, stops when
   settled, and shows the final state under reduced motion; the duration text is correct for today.
5. **Header layout:** widths 1600→320 in steps (1600, 1440, 1280, 1180, 1100,
   1024, 960, 900, 820, 768, 700, 600, 480, 390, 360, 320) × EN/FR: no overlap
   among logo, title, nav, language switcher, theme toggle, search and menu
   toggle; nothing clipped; header height stable.
6. **Performance:** throttled trace (4× CPU, Fast 4G, 390×844): LCP ≤ 1.0 s,
   CLS ≤ 0.03, no long tasks while the graph animates, "New graph" responds in < 16 ms.
7. **Lighthouse:** mobile and desktop; targets in §1.
8. **Visual review:** compare screenshots against the phase 0 baseline set; any
   difference must be intentional.

Gotchas from the Oct 2026 sessions:
- macOS headless Chrome enforces a ~500 px minimum width, so narrow screenshots
  fake an overflow. Test narrow widths with sized iframes or DevTools device emulation.
- A DevTools emulation reset can race with navigation; repeat a failure before trusting it.
- A static server may list directories (e.g. `/assets/`); GitHub Pages does not.

---

## 7. Things only the user can do (ask; don't assume)
- Switch the GitHub Pages source to "GitHub Actions" (phase 8).
- Choose the preview hosting (phase 7).
- Decide whether `/nmp*`, `/md/` and `/markdown.html` should keep redirecting.
- Approve dropping the `X-Frame-Options` meta tag.
- Approve the cutover.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A URL changes silently (SEO loss, broken saved links) | Manifest contract + `compare-urls.mjs` gate in phases 3 and 6 |
| Slashless URLs (`/publication/p6`) emitted as directories | `build.format: 'preserve'`; manifest records file vs directory form |
| FR projects use `/projects/X-fr/`, not `/fr/projets/X/` | Keep it. Changing it is a separate, user-approved decision with redirects |
| Liquid left in content renders as text | Converter fails on any unhandled `{%`/`{{`; phase 2 gate |
| Dark-mode residue from the ported CSS | Theme audit (§6.3) on every page |
| Search shows the wrong language | Pagefind `lang` filter; behaviour test |
| Search Console ownership lost | Copy `googlef74902c0964df8f1.html` to `public/`; check that it returns 200 |
| Big binary files bloat the repo or Action | They already live in git; no change. Don't move them to LFS during the migration |

## 9. Effort estimate
Roughly 2–3 focused agent sessions: phases 0–2 in one, 3–4 in one, 5–7 plus fixes
in one. Phase 8 is short but waits on the user.
