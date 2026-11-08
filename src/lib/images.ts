// The image a card should show for a markdown/HTML body: the first local image, else the
// first still (non-GIF) one, else the first of any; images inside code fences don't count.
type Image = { src: string; alt: string };

export function firstImage(markdown: string): Image | null {
  const text = markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  const found: (Image & { at: number })[] = [];
  // ![alt](url "title"), url may hold one level of parentheses
  for (const m of text.matchAll(/!\[([^\]]*)\]\(\s*((?:[^()\s]|\([^()\s]*\))+)[^)]*\)/g)) {
    found.push({ src: m[2], alt: m[1], at: m.index });
  }
  for (const m of text.matchAll(/<img\b[^>]*>/gi)) {
    const attr = (name: string) => {
      const a = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(m[0]);
      return a ? (a[1] ?? a[2]) : undefined;
    };
    const src = attr('src');
    if (src) found.push({ src, alt: attr('alt') ?? '', at: m.index });
  }
  found.sort((a, b) => a.at - b.at);
  const pick = found.find((i) => i.src.startsWith('/')) ?? found.find((i) => !/\.gif(\?|$)/i.test(i.src)) ?? found[0];
  return pick ? { src: pick.src, alt: pick.alt } : null;
}
