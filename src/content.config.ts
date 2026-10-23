import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { smart } from './lib/text';

// Front matter dates are calendar days; some are written 2021-9-01, which YAML leaves as a string.
const day = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  const [y, m, d] = v.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}, z.date());

const doc = z.object({
  title: z.string().transform(smart),
  date: day,
  venue: z.string(),
  type: z.string().optional(),
  location: z.string().optional(),
  permalink: z.string().startsWith('/').optional(),
  lang: z.literal('fr-CA').optional(),
  paperurl: z.url().optional(),
  citation: z.string().optional(),
});

// Keep the file name as the id (A-star-fr), the URL and the EN/FR twin rule depend on it.
const collection = (name: string) =>
  defineCollection({
    loader: glob({ base: `./src/content/${name}`, pattern: '*.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
    schema: doc,
  });

export const collections = {
  teaching: collection('teaching'),
  projects: collection('projects'),
  publications: collection('publications'),
  research: collection('research'),
  education: collection('education'),
  industry: collection('industry'),
  extracurricular: collection('extracurricular'),
};
