# benymaxparsa.github.io

Personal academic website of Parsa Kamalipour, in English and French (Québec).
Live at <https://benymaxparsa.github.io>.

Built with [Astro](https://astro.build) as a static site, with [Pagefind](https://pagefind.app) search.
No client framework; the small amount of browser JavaScript lives in `src/scripts/`.

## Develop

Requires Node 24.

```sh
npm ci
npm run dev        # local dev server
npm run check      # type-check
npm run build      # static site + search index in dist/
npm run preview    # serve dist/ on :4321 with GitHub Pages URL rules
```

## Where things are

| Path | What |
| --- | --- |
| `src/content/<collection>/*.md` | Collection docs (publications, research, teaching, projects, …). French twins end in `-fr.md`. |
| `src/pages/` | Standalone pages; French pages under `src/pages/fr/`. |
| `src/i18n.ts` | Navigation and UI text for both languages. |
| `src/lib/urls.ts` | Language pairs for pages that aren't collection docs. |
| `src/styles/` | `site.css` (compiled theme CSS, edit as plain CSS), `additions.css`, generated `icons.css`. |
| `public/` | Files copied as-is: images, PDFs in `files/`, favicons. |
| `scripts/build-icons.mjs` | Regenerates `icons.css`; add an icon class to its list and run it. |

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which type-checks, builds and publishes to GitHub Pages.

## Verify

```sh
node scripts/compare-urls.mjs dist docs/migration/url-manifest.json
node scripts/verify.mjs all http://localhost:4321 docs/migration/report
node scripts/behaviour.mjs http://localhost:4321
node scripts/perf.mjs http://localhost:4321 / 3
```

The migration from Jekyll is documented in `docs/ASTRO_MIGRATION_PLAN.md` and `docs/migration/report.md`.
The last Jekyll version is tagged `jekyll-final`.

## License

The stylesheet derives from [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) (MIT, see `LICENSE`).
Icons are generated from Font Awesome Free (CC BY 4.0) and Academicons (SIL OFL 1.1).
