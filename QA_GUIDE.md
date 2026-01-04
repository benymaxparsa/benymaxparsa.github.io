# French (Québec) Localization - QA Guide

## Quick Verification Guide

### How to Verify No English Remains in French Pages

#### Method 1: Visual Inspection (Recommended)
1. **Navigate to French pages:**
   - Start at: `https://benymaxparsa.github.io/fr/`
   - Click through all navigation items
   - Check language switcher shows "FR" as active

2. **Check for English text:**
   - Navigation menu should be in French
   - Page titles should be in French
   - All body content should be in French
   - Button labels should be in French
   - Form fields (if any) should be in French
   - Footer text should be in French
   - Error messages should be in French

3. **Exception - Items that should remain in English:**
   - Proper nouns (names, institutions)
   - Brand names (Twitter, GitHub, etc.)
   - Technical acronyms (CV, PDF, etc.)
   - Code snippets and technical terms
   - Collection item content (until individually translated)

#### Method 2: Browser DevTools Search
1. Open French page
2. Press `Ctrl+F` (or `Cmd+F` on Mac)
3. Search for common English words:
   - "The", "and", "or", "for"
   - "Click", "View", "Read more"
   - "Home", "About", "Contact"
4. Verify any matches are either:
   - Proper nouns
   - Technical terms
   - Inside code blocks
   - Collection items (known limitation)

#### Method 3: Page Source Check
1. Right-click → View Page Source
2. Check `<html lang="fr-CA">` is present
3. Verify hreflang tags exist:
   ```html
   <link rel="alternate" hreflang="en" href="..." />
   <link rel="alternate" hreflang="fr-CA" href="..." />
   ```
4. Check og:locale is set to fr_CA:
   ```html
   <meta property="og:locale" content="fr_CA">
   ```

---

## How to Add New Strings in the Future

### Adding UI Text Strings

**When to use:** For any repeated UI elements (buttons, labels, messages, etc.)

**Steps:**
1. **Add to English section** in `_data/ui-text.yml`:
   ```yaml
   en: &DEFAULT_EN
     my_new_button: "Click Here"
     # ... existing strings
   ```

2. **Add to French section** in `_data/ui-text.yml`:
   ```yaml
   fr-CA: &DEFAULT_FR_CA
     my_new_button: "Cliquez ici"
     # ... existing strings
   ```

3. **Use in templates:**
   ```liquid
   {{ site.data.ui-text[site.locale].my_new_button }}
   ```

**Translation Tips:**
- Use Quebec French terminology
- "Cliquez" not "Cliquer" (imperative form)
- "Courriel" not "email"
- "Télécharger" not "downloader"
- Add space before `:`, `;`, `?`, `!`

---

### Adding New Pages

**Steps:**

1. **Create English page:**
   ```yaml
   ---
   permalink: /my-new-page/
   title: "My New Page"
   author_profile: true
   ---
   
   English content here...
   ```

2. **Create French version:**
   ```yaml
   ---
   permalink: /fr/ma-nouvelle-page/
   lang: fr-CA
   title: "Ma nouvelle page"
   author_profile: true
   ---
   
   Contenu français ici...
   ```

3. **Add to navigation** (`_data/navigation.yml`):
   ```yaml
   main:
     - title: "My New Page"
       url: /my-new-page/
   
   main_fr:
     - title: "Ma nouvelle page"
       url: /fr/ma-nouvelle-page/
   ```

**Naming Convention:**
- English: `/about/`, `/contact/`, `/research/`
- French: `/fr/about/`, `/fr/contact/`, `/fr/recherche/`
- Use French slug in URL only if it improves clarity
- Keep technical URLs in English for consistency

---

### Adding Collection Items

**Example: Adding a new publication**

1. **English version** (`_publications/my-paper.md`):
   ```yaml
   ---
   title: "My Research Paper Title"
   collection: publications
   permalink: /publications/my-paper/
   venue: "Conference Name"
   date: 2025-01-15
   ---
   
   Abstract text in English...
   ```

2. **French version** (`_publications/my-paper-fr.md`):
   ```yaml
   ---
   title: "Titre de mon article de recherche"
   collection: publications
   permalink: /fr/publications/mon-article/
   venue: "Nom de la conférence"
   date: 2025-01-15
   lang: fr-CA
   ---
   
   Résumé en français...
   ```

**Important:**
- Use `-fr` suffix in filename: `item.md` → `item-fr.md`
- Set `lang: fr-CA` in French version
- Translate venue/location if generic (e.g., "Conference" → "Conférence")
- Keep venue name as-is if it's a proper noun
- Both versions should have same `date` for sorting

---

## Validation Checklist for New Content

Before publishing new bilingual content, verify:

### For Pages
- [ ] English and French versions created
- [ ] `lang: fr-CA` set in French page front matter
- [ ] Permalinks follow convention (`/page/` and `/fr/page/`)
- [ ] Page titles translated
- [ ] All body content translated
- [ ] Links work in both versions
- [ ] Navigation updated in both languages
- [ ] Images have alt text in correct language
- [ ] Any forms/buttons have translated labels

### For Collection Items
- [ ] Filename follows pattern (`item.md` and `item-fr.md`)
- [ ] `lang: fr-CA` in French version
- [ ] Permalinks follow convention
- [ ] Title translated
- [ ] Venue/location appropriately translated
- [ ] Date consistent across both versions
- [ ] Technical terms handled correctly

### For UI Strings
- [ ] Added to both `en` and `fr-CA` sections
- [ ] Natural Québec French used
- [ ] Consistent with existing terminology
- [ ] Tested in actual page context
- [ ] No typos or formatting issues

---

## Testing New Translations

### Local Testing (if Jekyll is installed)
```bash
# Build and serve
bundle exec jekyll serve

# Access
# English: http://localhost:4000/
# French: http://localhost:4000/fr/

# Check for errors in terminal output
```

### Manual Testing Steps
1. **Navigate to both versions**
   - English: `https://benymaxparsa.github.io/page/`
   - French: `https://benymaxparsa.github.io/fr/page/`

2. **Test language switcher**
   - Click EN/FR buttons
   - Verify URL changes correctly
   - Confirm active state shows correctly

3. **Check content**
   - All text translated
   - Links work
   - Images display
   - Layout correct

4. **Test navigation**
   - All menu items work
   - Breadcrumbs correct
   - Back button works

5. **Mobile testing**
   - Responsive layout works
   - Language switcher visible
   - Touch targets appropriate

---

## Common Translation Mistakes to Avoid

### ❌ Wrong: Literal Translation
```
"Click here to download" → "Cliquer ici pour downloader"
```

### ✅ Correct: Natural Québec French
```
"Click here to download" → "Cliquez ici pour télécharger"
```

---

### ❌ Wrong: France French Terminology
```
"Email" → "Email" or "Mail"
"Download" → "Téléchargement"
```

### ✅ Correct: Québec French Terminology
```
"Email" → "Courriel"
"Download" → "Téléchargement" (noun) / "Télécharger" (verb)
```

---

### ❌ Wrong: Missing Spaces Before Punctuation
```
"Quoi? Comment?"
"Liste: item1, item2"
```

### ✅ Correct: Proper French Spacing
```
"Quoi ? Comment ?"
"Liste : item1, item2"
```

---

### ❌ Wrong: Inconsistent Terminology
```
Page 1: "ordinateur"
Page 2: "computer"
```

### ✅ Correct: Consistent Throughout Site
```
All pages: "ordinateur" or keep "computer" if it's a technical term
```

---

## Process to Avoid Missing Text

### Pre-Translation Checklist
1. **Inventory all text:**
   - Page titles
   - Headings (h1-h6)
   - Paragraphs
   - Lists
   - Buttons/Links
   - Form labels
   - Placeholder text
   - Error messages
   - Alt text
   - ARIA labels
   - Meta descriptions

2. **Mark technical terms:**
   - Identify what should NOT be translated
   - Proper nouns
   - Brand names
   - Technical acronyms
   - Code snippets

3. **Create translation document:**
   - List all English strings
   - Mark context (where used)
   - Translate systematically
   - Review for consistency

### During Translation
1. **Use consistent terminology:**
   - Keep glossary of key terms
   - Refer to existing translations
   - Check Quebec French resources

2. **Maintain formatting:**
   - Keep Markdown syntax
   - Preserve links
   - Don't break interpolation variables
   - Keep HTML structure

3. **Test incrementally:**
   - Don't wait until everything is done
   - Test pages as you complete them
   - Fix issues immediately

### Post-Translation Review
1. **Content review:**
   - Read through French version
   - Check for awkward phrasing
   - Verify technical accuracy

2. **Technical review:**
   - All pages accessible
   - Navigation works
   - Links point to correct URLs
   - Images display

3. **User testing:**
   - Have native Québécois review
   - Check on different devices
   - Test with screen readers

---

## Resources for Québec French Translation

### Official Resources
- **Office québécois de la langue française (OQLF):**  
  https://www.oqlf.gouv.qc.ca/
  - Grand dictionnaire terminologique
  - Language guides and recommendations

- **Termium Plus (Government of Canada):**  
  https://www.btb.termiumplus.gc.ca/
  - Official terminology database
  - English-French technical terms

### Style Guides
- **Canadian Translation Bureau Style Guide:**
  https://www.noslangues-ourlanguages.gc.ca/
  
- **Le guide du rédacteur (Government of Canada):**
  Writing guide for French

### Quick Reference
- Use "courriel" not "email"
- Use "logiciel" not "software"
- Use "site Web" not "website"
- Use "télécharger" not "downloader"
- Use "clavardage" not "chat" (in appropriate contexts)
- Space before `:`, `;`, `?`, `!`
- Use guillemets « » for quotations

---

## Reporting Issues

If you find English text on French pages or translation issues:

1. **Document the issue:**
   - Page URL
   - Location on page
   - Current text (English)
   - Suggested translation (French)

2. **Check if it's intentional:**
   - Proper noun?
   - Technical term?
   - Collection item (known limitation)?

3. **Fix or report:**
   - If you can fix: follow "Adding New Strings" guide
   - If unsure: document and ask for review

---

## Summary

**To avoid missing text in the future:**
1. Use UI text system for all repeated strings
2. Always create both EN and FR versions
3. Test both versions before publishing
4. Maintain glossary of translated terms
5. Review with native speaker when possible

**Remember:**
- Quality over speed
- Natural phrasing over literal translation
- Consistency throughout the site
- Test, test, test!
