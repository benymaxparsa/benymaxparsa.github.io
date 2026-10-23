// Listing excerpts exactly as Jekyll made them: the source up to the first blank
// line, rendered. Galleries were inlined as <figure> blocks padded with blank lines
// (convert-content.mjs); an include that had no blank line around it in the
// original belongs to the same excerpt as its neighbours, so undo that padding first.
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';

let processor: ReturnType<typeof createSatteriMarkdownProcessor> | undefined;

export async function listExcerpt(body: string): Promise<string> {
  // Exactly one padding blank line on a side means the original had none there
  const glued = body
    .trimStart()
    .replace(/([^\n])\n\n(<figure[^\n]*<\/figure>)/g, '$1\n$2')
    .replace(/(<figure[^\n]*<\/figure>)\n\n(?=[^\n])/g, '$1\n')
    .replace(/\n{3,}/g, '\n\n');
  const chunk = glued.split(/\n\n/)[0].replace(/\n?(<figure[^\n]*<\/figure>)\n?/g, '\n\n$1\n\n');
  processor ??= createSatteriMarkdownProcessor({ syntaxHighlight: false });
  return (await (await processor).render(chunk)).code;
}
