---
title: "Petit à petit français : une application pour pratiquer le français, avec des voix naturelles de France et du Québec"
type: "Projet personnel à code source ouvert"
venue: "Petit à petit français"
date: 2026-11-04
location: "Montréal, Québec"
collection: projects
lang: fr-CA
---

- Création d’une application gratuite pour pratiquer le français aux niveaux A1–A2, où le français du Québec est un accent à part entière à côté de celui de France, après avoir constaté, en apprenant le français à Montréal, que la plupart des applications l’ignorent.
- 69 leçons regroupées en unités, exercices de conjugaison dans 8 temps, dictées et aide-mémoires avec recherche, soit 239 verbes, 637 phrases d’exercice et 3 443 mots ; la révision espacée ramène chaque élément juste avant qu’on l’oublie, et la correction accepte les réponses équivalentes et signale lettre par lettre les fautes d’accent et d’orthographe.
- Des voix neuronales naturelles (Azure Denise et Sylvie) dans tous les navigateurs, y compris Safari et l’iPhone, servies par un petit Worker Cloudflare qui conserve chaque extrait pour qu’une phrase ne soit générée qu’une fois ; le tout fonctionne entièrement sur des forfaits gratuits, avec la voix de l’appareil en secours.
- Une application Web statique en JavaScript pur (sans cadriciel ni étape de compilation) qui fonctionne hors ligne, s’installe comme une application (PWA), se synchronise au besoin par le Google Drive ou l’iCloud de l’apprenant et suit les lignes directrices WCAG 2.2.
- [Site Web](https://petitfrench.parsakp.com)
- [Code et dépôt GitHub](https://github.com/Petit-a-petit-francais/Petit-a-petit-francais.github.io)

<figure class="half"><a href="/images/PetitFrench-home.jpg" title="Écran d’accueil"><img src="/images/PetitFrench-home.jpg" loading="lazy" decoding="async" alt="Écran d’accueil de Petit à petit français : le salut Bonjour, la révision du jour de 15 cartes, un panneau de série et de progression pour les verbes, la grammaire et le vocabulaire, et la prochaine leçon"></a><a href="/images/PetitFrench-lesson.jpg" title="Une leçon"><img src="/images/PetitFrench-lesson.jpg" loading="lazy" decoding="async" alt="La leçon sur le présent : la règle clé, puis un tableau des terminaisons -er, -ir et -re pour parler, finir et vendre, terminaisons en couleur"></a><figcaption>L’écran d’accueil et une leçon sur le présent</figcaption></figure>
