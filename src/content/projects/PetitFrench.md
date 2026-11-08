---
title: "Petit à petit français: A French practice app with natural France and Québec voices"
type: "Personal Open-Source Project"
venue: "Petit à petit français"
date: 2026-11-04
location: "Montreal, Quebec"
tags: ["JavaScript", "PWA", "Cloudflare Workers"]
collection: projects
---
- Built a free French practice app for A1–A2 learners, with Québec French as a first-class accent next to France, after finding that most apps ignore it while learning French in Montreal.
- 69 lessons in course units, verb drills in 8 tenses, dictation and searchable cheatsheets, covering 239 verbs, 637 practice sentences and 3,443 words; spaced-repetition review brings each item back just before you’d forget it, and the grading accepts alternative answers and points out accent and spelling slips letter by letter.
- Natural neural voices (Azure Denise and Sylvie) in every browser, including Safari and iPhone, served through a small Cloudflare Worker that caches each clip so a phrase is only made once; it runs entirely on free tiers, with the device voice as fallback.
- A static web app in plain JavaScript (no framework, no build step) that works offline, installs as an app (PWA), syncs optionally through the learner’s own Google Drive or iCloud, and is built to WCAG 2.2 guidelines.
- [Website](https://petitfrench.parsakp.com)
- [Codes and GitHub Repository](https://github.com/Petit-a-petit-francais/Petit-a-petit-francais.github.io)

<figure class="half"><a href="/images/PetitFrench-home.jpg" title="Home screen"><img src="/images/PetitFrench-home.jpg" loading="lazy" decoding="async" alt="Petit à petit français home screen: Bonjour greeting, today's review of 15 cards, a streak and progress panel for verbs, grammar and vocabulary, and the next lesson"></a><a href="/images/PetitFrench-lesson.jpg" title="A lesson"><img src="/images/PetitFrench-lesson.jpg" loading="lazy" decoding="async" alt="The present tense lesson: the key rule, then a table of -er, -ir and -re endings for parler, finir and vendre with the endings highlighted"></a><figcaption>Home screen and a lesson on the present tense</figcaption></figure>
