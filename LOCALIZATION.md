# French (Québec) Localization - Documentation

## Overview

This site now supports full bilingual operation in English (en-US) and French Canadian/Québec (fr-CA). The implementation uses Jekyll's built-in features with the Minimal Mistakes theme's localization system.

## Implementation Summary

### 1. Infrastructure Components

#### Language Detection
- Pages under `/fr/` are automatically detected as French
- `lang` attribute is set in page front matter: `lang: fr-CA`
- HTML `lang` attribute is dynamically set based on URL

#### UI Text System
- All UI strings are defined in `_data/ui-text.yml`
- French Canadian locale (`fr-CA`) added with Québec-specific translations
- Key differences from France French:
  - "Courriel" instead of "Email"
  - Natural Québec phrasing and expressions
  - Proper use of formal address

#### Navigation
- Separate navigation defined in `_data/navigation.yml`:
  - `main` - English navigation
  - `main_fr` - French navigation
- Masthead dynamically loads correct navigation based on page language

#### Language Switcher
- Located in `_includes/language-switcher.html`
- Appears in masthead navigation
- Maintains URL structure (e.g., `/about/` ↔ `/fr/about/`)
- Styled to indicate active language

### 2. SEO & Metadata

#### Hreflang Tags
- Automatically generated in `_includes/seo.html`
- Links English and French versions of each page
- Includes `x-default` pointing to English version

#### Open Graph & Social
- `og:locale` set to `fr_CA` for French pages
- Canonical URLs properly set for each language

#### Lang Attribute
- HTML `lang` attribute set in `_layouts/default.html`
- Dynamically switches between `en-US` and `fr-CA`

### 3. Page Structure

All main pages have been translated:
- Homepage (`/` → `/fr/`)
- CV (`/cv/` → `/fr/cv/`)
- Contact (`/contact/` → `/fr/contact/`)
- Biography (`/biography/` → `/fr/biographie/`)
- News (`/news/` → `/fr/nouvelles/`)
- Gallery (`/gallery/` → `/fr/galerie/`)
- Selected Courses (`/selected_courses/` → `/fr/cours/`)
- Honors & Awards (`/honors_and_extra/` → `/fr/distinctions/`)

Collection landing pages:
- Research (`/research/` → `/fr/recherche/`)
- Publications (`/publications/` → `/fr/publications/`)
- Teaching (`/teaching/` → `/fr/enseignement/`)
- Education (`/education/` → `/fr/formation/`)
- Projects (`/projects/` → `/fr/projets/`)
- Industry (`/industry/` → `/fr/experiences/`)
- Extracurricular (`/extracurricular/` → `/fr/activites/`)

### 4. Québec French Translation Guidelines

When translating content, follow these Québec French conventions:

**Key Terms:**
- Email → Courriel
- Website → Site Web
- Download → Télécharger
- Upload → Téléverser
- Software → Logiciel
- Computer Science → Informatique
- Research → Recherche
- Teaching → Enseignement
- Skills → Compétences
- Log in/Log out → Connexion/Déconnexion
- Chat → Clavardage (in appropriate contexts)

**Style Guidelines:**
- Use formal "vous" form
- Add spaces before `:`, `;`, `?`, `!`
- Use guillemets « » for quotations
- Professional and clear tone
- Natural Québec phrasing, not literal translation

## How to Add New Content

### Adding a New Page

1. **Create English page** (if not exists): `_pages/my-page.md`
   ```yaml
   ---
   permalink: /my-page/
   title: "My Page Title"
   author_profile: true
   ---
   
   English content here...
   ```

2. **Create French version**: `_pages/fr/my-page.md`
   ```yaml
   ---
   permalink: /fr/ma-page/
   lang: fr-CA
   title: "Titre de ma page"
   author_profile: true
   ---
   
   Contenu français ici...
   ```

3. **Add to navigation** in `_data/navigation.yml`:
   ```yaml
   # English
   main:
     - title: "My Page"
       url: /my-page/
   
   # French
   main_fr:
     - title: "Ma page"
       url: /fr/ma-page/
   ```

### Adding Collection Items

For individual collection items (research, publications, teaching, etc.):

1. **English item**: `_research/my-research.md`
   ```yaml
   ---
   title: "Research Title"
   collection: research
   permalink: /research/my-research/
   ---
   
   English content...
   ```

2. **French item**: `_research/my-research-fr.md`
   ```yaml
   ---
   title: "Titre de la recherche"
   collection: research
   permalink: /fr/recherche/ma-recherche/
   lang: fr-CA
   ---
   
   Contenu français...
   ```

### Translating UI Strings

Edit `_data/ui-text.yml` under the `fr-CA` section to add new UI strings:

```yaml
fr-CA: &DEFAULT_FR_CA
  my_new_label: "Mon nouveau libellé"
  # ... other labels
```

Use in templates:
```liquid
{{ site.data.ui-text[site.locale].my_new_label }}
```

## Testing

### Local Testing

1. **Install dependencies:**
   ```bash
   bundle install
   ```

2. **Build and serve:**
   ```bash
   bundle exec jekyll serve
   ```

3. **Access:**
   - English: `http://localhost:4000/`
   - French: `http://localhost:4000/fr/`

### Validation Checklist

- [ ] All pages have French equivalents
- [ ] Language switcher works on all pages
- [ ] Navigation displays correctly in both languages
- [ ] No English text visible on French pages (except proper nouns)
- [ ] Hreflang tags present in page source
- [ ] HTML lang attribute matches page language
- [ ] All links work in both languages
- [ ] Forms and interactive elements work in French
- [ ] Meta descriptions translated
- [ ] Alt text on images translated
- [ ] 404 page available in French

## Common Issues & Solutions

### Issue: Language Switcher Shows Wrong Language
**Solution:** Check that page URL starts with `/fr/` for French pages and lang is set in front matter.

### Issue: Navigation Not Switching
**Solution:** Verify `_data/navigation.yml` has both `main` and `main_fr` sections.

### Issue: UI Text Not Translating
**Solution:** Check that `site.locale` is set correctly and UI text exists in `fr-CA` section of `ui-text.yml`.

### Issue: Hreflang Tags Missing
**Solution:** Ensure `_includes/seo.html` has the hreflang logic and is included in page head.

## Coverage Status

### Fully Translated ✅
- Core infrastructure (language switcher, navigation, SEO)
- All main pages
- All collection landing pages
- UI text system
- 404 page

### Partially Translated ⚠️
- Individual collection items (research, publications, teaching, etc.)
  - **Note:** These display in English currently as they require manual translation
  - Framework is in place to support French versions

### Not Translated ❌
- Collection item content (55 items)
  - Recommended: Translate high-priority items first
  - Use template above to create French versions

## Future Maintenance

### Adding New Strings
1. Add to `_data/ui-text.yml` under both `en` and `fr-CA`
2. Use in templates via `{{ site.data.ui-text[site.locale].key_name }}`

### Adding New Pages
1. Create both English and French versions
2. Add to navigation in both languages
3. Ensure permalinks follow naming convention

### Quality Assurance
- Review French translations regularly for natural phrasing
- Test language switching across all pages
- Validate SEO tags with tools like Screaming Frog or Google Search Console
- Monitor for broken links in either language

## Accessibility Notes

- Language switcher includes proper ARIA labels
- `lang` attribute properly set for screen readers
- All interactive elements have translated labels
- Keyboard navigation works in both languages

## Contact for Translation Questions

For questions about Québec French translations or localization issues, please consult:
- Office québécois de la langue française: https://www.oqlf.gouv.qc.ca/
- Termium Plus (Government of Canada terminology): https://www.btb.termiumplus.gc.ca/
