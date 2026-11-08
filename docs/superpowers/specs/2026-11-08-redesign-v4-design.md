# Redesign v4 — design

Date: 2026-11-08 · Branch: `feat/redesign-v4` (from `master` at d9e436d) · Status: draft for approval

## Intent

Parsa does not like the current "graph-paper notebook" look (v3) and wants the site rebuilt from the ground up: new visual system, new components, and a rethought information structure. The new look is a personal mix of four reference systems (Clay, Mastercard, Apple, Meta; full specs fetched with `npx getdesign@latest add <name>`). It should read first as a serious researcher's site (academics, PhD admissions), while still working for industry recruiters and for the students he teaches.

## Goals

- A calm, warm, editorial site that feels designed rather than templated.
- A visitor understands within one screen who Parsa is, what he researches, and where to go next.
- The ~13 sections become 5 clear navigation groups.
- Light and dark modes are equally finished.
- Accessibility and performance stay at the current bar: WCAG AA contrast, keyboard-complete, Lighthouse 100 on a11y/SEO, no horizontal scroll at 375px.

## Non-goals

- No content rewriting. Existing text, publications, projects, news and course materials are kept as they are (layout changes, not copy changes).
- No URL changes. Every current EN and FR URL still resolves to the same content.
- No move away from Astro or GitHub Pages.

## Anti-goals (a failure even if it works)

- Looking like a SaaS landing page or a generic template.
- More than one accent colour, or decorative gradients.
- Motion that gets in the way of reading, or that runs under `prefers-reduced-motion`.
- French pages that are second-class (missing components or untranslated UI strings).

## Decisions made by Parsa

| Area | Decision | Source system |
|---|---|---|
| Canvas / mood | Warm cream editorial; page never pure white | Mastercard / Clay |
| Accent | One blue for every interactive element (links, buttons, focus); nothing else coloured | Apple |
| Shapes | Pill buttons and chips everywhere; 24–32px rounded cards; full-bleed rounded photo cards | Meta |
| Type | One clean sans, tight headlines (weight 500–600, negative tracking), 17px body | Apple / Mastercard |
| Hero | Keep the label-propagation graph, restyled to the new palette inside a big rounded card beside a tight headline | own |
| Dark mode | Keep the toggle; warm near-black twin with cream text and a brighter blue | Mastercard / Apple |
| Navigation | Floating white pill bar below the top edge, faint shadow | Mastercard |
| Scope | New visuals **and** rethought structure | — |
| Audience | Mostly academics/PhD, also industry and students | — |
| Homepage | Graph hero, then a bento grid of rounded cards linking deeper | Meta / Apple |
| Nav groups | 5: Research · Teaching · About · News · CV/Contact | — |
| Projects | Big rounded photo cards, title + tag chips, 2-up grid, one featured full-width | Meta |
| Motion | Expressive (scroll reveals, staggered cards, sliding nav highlight), all disabled under reduced motion | — |
| Footer | Dark warm footer: big friendly line, 4 link columns, socials, licence note | Mastercard |
| Photo | Small round avatar in the hero next to his name | — |
| Search | Kept from day one: search icon button in the nav pill, restyled | — |
| PR #9 / polish features | Start fresh; re-add lightbox, slideshows, breadcrumbs, sliding switches one by one only when Parsa asks | — |
| Git | Fresh branch from `master`; PR #9 stays open and unused | — |

## Design tokens

Values below are the starting point; the builder may nudge them to pass contrast checks.

### Colour — light

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#F3F0EE` | page background |
| `--surface` | `#FCFBFA` | raised cards, bento tiles |
| `--surface-pill` | `#FFFFFF` | nav pill, chips on cards |
| `--ink` | `#141413` | headlines, body text, primary button fill |
| `--muted` | `#696969` | secondary text, meta, captions |
| `--hairline` | `rgba(20,20,19,.10)` | card borders, dividers |
| `--accent` | `#0066CC` | links, primary CTA, focus ring, active nav |
| `--accent-press` | `#0057AD` | pressed state |

### Colour — dark (warm twin)

| Token | Value |
|---|---|
| `--canvas` | `#141413` |
| `--surface` | `#1E1E1C` |
| `--surface-pill` | `#262624` |
| `--ink` | `#F3F0EE` |
| `--muted` | `#A8A49E` |
| `--hairline` | `rgba(243,240,238,.12)` |
| `--accent` | `#2997FF` |
| `--accent-press` | `#5AAEFF` |

Footer is `#141413` with cream text in **both** modes (in dark mode it separates by a hairline top border).

The graph's light/dark `PALETTES` in `src/scripts/graph.ts` are recoloured from these tokens: neutral nodes in ink/muted, the propagating labels in the accent blue plus 2–3 desaturated warm tints. My call: the graph is the one place a few extra tints are allowed, because they encode data (communities), not decoration.

### Typography

- Family: **Inter Variable** (self-hosted via `@fontsource-variable/inter`), stack `"Inter Variable", system-ui, -apple-system, sans-serif`. Replaces Schibsted Grotesk and Source Serif 4 (both removed).
- Scale (desktop → phone):

| Role | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Display (hero h1) | 64 → 40px | 600 | 1.05 | -0.02em |
| H1 page title | 48 → 34px | 600 | 1.1 | -0.02em |
| H2 section | 32 → 26px | 600 | 1.15 | -0.015em |
| H3 card title | 22 → 20px | 600 | 1.25 | -0.01em |
| Lead | 21px | 400 | 1.45 | -0.01em |
| Body | 17px | 400 | 1.5 | -0.01em |
| Small / meta | 14px | 400 | 1.45 | 0 |
| Eyebrow | 13px | 600 uppercase | 1.2 | +0.06em, preceded by a 6px accent dot |
| Button / chip | 15px | 600 | 1 | -0.01em |

- Use `clamp()` for the size steps.

### Shape, space, elevation

- Radii: `8px` inputs/small images · `16px` small cards, list rows · `24px` bento tiles · `32px` hero card, project photo cards · `999px` buttons, chips, nav pill, switches.
- Spacing: 4px base; section rhythm 96px desktop / 56px phone; card padding 32px / 24px; content max width 1200px with 24px phone gutters.
- Elevation: flat by default. Exactly two shadows: nav pill `0 4px 24px rgba(0,0,0,.06)`, and hover-lift on clickable cards `0 16px 40px rgba(0,0,0,.08)`.
- Press state on every button and clickable card: `transform: scale(.97)`.

## Components

- **Nav pill** (`Masthead.astro`, rewritten). Floats 16px below the top, centred, max 1100px wide, white (`--surface-pill`), sticky. Left: logo + name. Centre: 5 groups. Right: search icon button (opens the existing Pagefind dialog, restyled), EN/FR switch and theme toggle as simple pill buttons. A sliding highlight sits under the current/hovered group. Groups with several pages open a small rounded dropdown panel (disclosure button, `aria-expanded`, Esc closes, arrow-key friendly). On phones (< 768px) the pill keeps logo + menu button; the menu opens a full-screen cream overlay listing all groups and their pages. The current greedy-nav overflow logic is removed.
- **Buttons**: primary = accent-blue pill, white text; secondary = ink 1.5px outline pill; text link = accent blue, underline on hover/focus.
- **Chips**: pill, `--surface-pill` fill, hairline border, 14px; used for tags and topics.
- **Eyebrow**: accent dot + uppercase label above section titles.
- **Hero card**: 2-column on desktop (small circular photo of Parsa beside his name above the headline (from `HomePhoto`), then headline, one-line lead, two buttons "Research" and "CV" on the left; graph in a 32px-rounded `--surface` card on the right); stacks on phones with the graph below the text.
- **Bento grid**: CSS grid, 12 columns desktop / 6 tablet / 1 phone, 24px gap; tiles are 24px-rounded `--surface` cards, each with eyebrow, title, short text and an arrow link; whole tile clickable.
- **Project card**: 32px-rounded photo card, image fills the top (16:10), title + year + tag chips below; featured variant spans full width with image left/text right.
- **List rows** (publications, news, teaching, education, industry): 16px-rounded rows on `--surface`, date/meta in muted, title in ink, chips at the end; no card-in-card nesting.
- **Long-form pages** (biography, project and course pages via `DocPage.astro` / `MdPage.astro`): 720px reading column, 17px body, headings on the scale above, images 16px-rounded.
- **Course materials** (`CourseMaterials.astro`): restyled to list rows with topic chips; behaviour unchanged.
- **Footer** (`Footer.astro`, rewritten): dark warm block, large line ("Let's talk research." / FR "Parlons recherche."), 4 link columns matching the nav groups, social icons, then a hairline and a bottom row with © year, CC BY-NC-SA note, language switch.
- **Theme toggle / language switch**: plain pill buttons (no sliding knobs; those were PR #9 features and come back only on request).

## Information architecture

Navigation groups (EN / FR) map to existing pages; no URL changes:

1. **Research / Recherche**: research, publications, projects
2. **Teaching / Enseignement**: teaching, selected courses, course materials
3. **About / À propos**: biography, education, industry, honours & extracurricular, extracurricular, gallery
4. **News / Nouvelles**: news (single link)
5. **CV & Contact**: CV, contact

`nav` in `src/i18n.ts` becomes a grouped structure (group title + child links, EN and FR). The footer columns reuse it.

### Homepage (EN `/` and FR `/fr/`)

1. Hero (headline, lead, two buttons, graph card).
2. Bento grid, in this order (desktop spans in brackets):
   - Research focus (8 cols): current interests as chips + one sentence; links to Research.
   - Latest publication (4): newest item from the publications collection.
   - Featured project (6): photo card of the first featured project.
   - Teaching (6): current course(s) + link to materials.
   - Latest news (8): 3 most recent items.
   - Contact / CV (4): two pill buttons.
3. Footer.

The current homepage sections (research blurb, selected publications, recent news) are absorbed into the bento tiles.

## Motion

- Scroll reveal: elements fade up 16px over 500ms with `cubic-bezier(.2,.7,.2,1)` via IntersectionObserver; bento tiles and project cards stagger by 60ms.
- Sliding nav highlight: 250ms transform transition.
- Card hover: lift 4px + shadow, 200ms.
- Graph animation: as now.
- Under `prefers-reduced-motion: reduce`: no reveals (content visible immediately), no transforms, graph shows its final state.
- Content must never depend on JS to become visible (reveal class added by JS only).

## Constraints

- Astro 7, static output to GitHub Pages; build script `astro build && optimize-images && pagefind` stays.
- EN/FR parity on every component and UI string (`src/i18n.ts`).
- Old v3 styles (`site.css`, `additions.css`) are replaced, not layered on: the builder writes a new stylesheet set and deletes the old ones once all pages render. This avoids the v3 Sass/specificity traps.
- Ponytail rules for code: smallest complete change, no new dependency beyond `@fontsource-variable/inter`, no speculative options.
- Search: Pagefind index and dialog stay; only the styling changes.

## Verification

- `npm run build` and `npm run check` pass.
- Existing crawl / link check: 0 broken links or images; URL list identical to `master`.
- Contrast/overflow audit (`scripts/` puppeteer checks) at 1440, 1024, 768 and 375px, light and dark.
- Keyboard pass: nav dropdowns, menu overlay, theme and language buttons, focus ring visible everywhere.
- Lighthouse a11y/SEO 100 on home EN, home FR, a project page, the publications page.
- Before/after screenshots of each page type, light and dark, sent to Parsa.

## Left to the builder

- Exact copy of the hero headline/lead (taken from the existing homepage text).
- Icon set for footer socials (reuse `icons.css`).
- Whether a page type needs a dedicated layout or can reuse `Single`/`Archive`.
- Order of work, as long as the homepage + nav + footer land first so Parsa can react early.

---

## Revision 1 (2026-11-08): direction A, "Communities"

After seeing the first homepage build, Parsa rejected the cream/one-blue look ("all of it" felt off: generic, boxy, weak hero, wrong colours). Three throwaway mockups were compared; he chose **A: Communities**. This revision overrides the sections above wherever they conflict.

**Idea.** The site is a graph and each nav group is a *community* with its own colour. The hero graph's communities use the same four colours, and each group's pages carry that colour.

| Group | Colour | Text on it |
|---|---|---|
| Research (research, publications, projects) | teal `#0F3D3A` (dark mode `#1A5A54`) | `#F4F1EC` |
| Teaching | lavender `#B9A7F2` | ink |
| About | coral `#FF6B57` | ink |
| News | ochre `#F0BE45` | ink |
| CV & Contact | ink `#15171A` (footer slab) | `#F4F1EC` |

**Decisions (Parsa):** keep the 5 nav groups; keep the floating pill nav (each group gets its colour dot); dark mode stays: near-black canvas, same group colours (teal lifted for separation); footer is a rounded ink slab ("Let's talk research.", link columns, socials) acting as the CV & Contact community.

**Replaces from the original spec:**
- Canvas: white `#FFFFFF` (dark `#111315`), not cream. Surface `#F4F4F2` (dark `#1B1E21`). Ink `#15171A` (dark `#F2F2EF`). Muted `#5B5F66` (dark `#A3A7AD`).
- No single blue accent. Buttons are ink pills (dark mode: light pills). Body links are ink, underlined, with the underline in the page's group colour. Focus ring is ink (light) / light (dark), and the slab's text colour inside slabs.
- Typeface: **Bricolage Grotesque** variable (self-hosted, `@fontsource-variable/bricolage-grotesque`), one family; display at 800 with tight tracking (-0.04em), body 18px/1.55.
- No all-caps eyebrows with dots, no "→" appended to links, no identical bordered card grid.
- Homepage: hero (avatar, big headline "Finding the groups hidden inside a graph.", lead, two ink buttons; the graph in the four colours with a legend linking to the sections), then one rounded slab (36px) per community in nav order: Research (thesis, latest papers, featured projects), Teaching (courses, award, materials), About (short bio, links to biography/education/industry), News (latest 3), then the ink footer slab.
- Inner pages: a rounded slab header in the page's group colour holding the page title; body on white; list rows and project cards use neutral surfaces with the group colour as the only accent.
- Motion: one orchestrated moment (hero graph assembling); slabs and cards do not each fade in. Hover is limited to links/buttons and card image zoom.
