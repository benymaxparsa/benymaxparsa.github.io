// The first image a markdown/HTML body shows, for card thumbnails.
export function firstImage(markdown: string): { src: string; alt: string } | null {
  const text = markdown.replace(/^```[\s\S]*?^```/gm, '');
  const md = /!\[([^\]]*)\]\(\s*([^)\s]+)[^)]*\)/.exec(text);
  const html = /<img\b[^>]*>/i.exec(text);
  if (html && (!md || html.index < md.index)) {
    const attr = (name: string) => new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(html[0])?.[1];
    const src = attr('src');
    if (src) return { src, alt: attr('alt') ?? '' };
  }
  return md ? { src: md[2], alt: md[1] } : null;
}
