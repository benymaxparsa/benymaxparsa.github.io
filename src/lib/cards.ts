// Markup transforms for listing-card excerpts (rendered Markdown as an HTML string).

const LINK_ONLY = /^<li>\s*<a\b[^>]*>[^<]*<\/a>\s*<\/li>$/;

/**
 * A long bullet list keeps its first `keep` text bullets and folds the rest into a <details>.
 * Link-only bullets (Website, GitHub, Report...) stay visible after it. Lists with nested lists,
 * or with only one bullet too many, are left alone.
 */
export function foldBullets(html: string, summary: string, keep = 2): string {
  const m = html.match(/<ul>([\s\S]*?)<\/ul>/);
  if (!m || /<[uo]l\b/.test(m[1])) return html;
  const items = m[1].match(/<li>[\s\S]*?<\/li>/g) ?? [];
  const links = items.filter((li) => LINK_ONLY.test(li));
  const text = items.filter((li) => !LINK_ONLY.test(li));
  if (text.length <= keep + 1) return html;
  const out =
    `<ul>${text.slice(0, keep).join('\n')}</ul>` +
    `<details class="more"><summary>${summary}</summary><ul>${text.slice(keep).join('\n')}</ul></details>` +
    (links.length ? `<ul>${links.join('\n')}</ul>` : '');
  return html.replace(m[0], () => out);
}

/**
 * A gallery figure (.half / .third) with two or more linked images becomes a slideshow:
 * the markup gets its arrows and dots here so the card never shifts; enhancements.ts wires them up.
 */
export function slideshow(html: string, prev: string, next: string): string {
  return html.replace(/<figure class="(half|third)"([^>]*)>([\s\S]*?)<\/figure>/g, (whole, cls: string, rest: string, inner: string) => {
    const anchors = inner.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
    if (anchors.length < 2) return whole;
    const dots = anchors.map((_, i) => `<span${i ? '' : ' class="is-on"'}></span>`).join('');
    return (
      `<figure class="${cls} is-slides"${rest}>${inner.replace(/<a\b/, '<a class="is-active"')}` +
      `<button type="button" class="slide-btn slide-prev" aria-label="${prev}">‹</button>` +
      `<button type="button" class="slide-btn slide-next" aria-label="${next}">›</button>` +
      `<span class="slide-dots" aria-hidden="true">${dots}</span></figure>`
    );
  });
}
