const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

export const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e]).replace(/\s+/g, ' ').trim();

// Meta description for a page: starts at the abstract when there is one, skips figures
// (their captions read "screenshot"), and joins blocks so a lead-in like "Designing and implementation of:"
// is followed by its list instead of standing alone
export function excerpt(html: string, max = 160): string | undefined {
  const abstract = html.search(/<h\d[^>]*>\s*(Abstract|Résumé)/i);
  if (abstract >= 0) html = html.slice(abstract).replace(/^<h\d[^>]*>[\s\S]*?<\/h\d>/, '');
  const text = stripHtml(html.replace(/<figure[\s\S]*?<\/figure>/g, ' '));
  if (!text) return undefined;
  return text.length > max ? text.slice(0, max).replace(/\s\S*$/, '') + '…' : text;
}

// SmartyPants quotes, as Jekyll's markdownify gave every title
export const smart = (s: string) =>
  s.replace(/(\w)'(?=\w)/g, '$1’').replace(/(^|[\s([{—-])'/g, '$1‘').replace(/'/g, '’')
    .replace(/(^|[\s([{—-])"/g, '$1“').replace(/"/g, '”');
