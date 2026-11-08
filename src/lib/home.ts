// What the homepage bento shows from the collections (newest first everywhere).
import type { Lang } from '../i18n';
import { docs, type Doc } from './urls';
import { firstImage } from './images';

export const latestPublication = async (lang: Lang): Promise<Doc> => (await docs('publications', lang)).at(-1)!;

export async function featuredProject(lang: Lang): Promise<{ doc: Doc; image: { src: string; alt: string } | null }> {
  const doc = (await docs('projects', lang)).at(-1)!;
  return { doc, image: firstImage(doc.body ?? '') };
}
