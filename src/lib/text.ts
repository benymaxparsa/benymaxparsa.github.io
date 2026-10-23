const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

export const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e]).replace(/\s+/g, ' ').trim();

// Text of the first block that has any, like Jekyll's excerpt (content up to the first blank line)
export function excerpt(html: string, max = 300): string | undefined {
  for (const block of html.split(/\n\s*\n|(?<=<\/(?:p|ul|ol|figure|h\d|div|blockquote)>)/)) {
    const text = stripHtml(block);
    if (text) return text.length > max ? text.slice(0, max).replace(/\s\S*$/, '') + '…' : text;
  }
  return undefined;
}

// SmartyPants quotes, as Jekyll's markdownify gave every title
export const smart = (s: string) =>
  s.replace(/(\w)'(?=\w)/g, '$1’').replace(/(^|[\s([{—-])'/g, '$1‘').replace(/'/g, '’')
    .replace(/(^|[\s([{—-])"/g, '$1“').replace(/"/g, '”');
