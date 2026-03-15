---
title: "Détection de communautés Spider : expansion géodésique à partir de graines avec raffinement guidé par la modularité et appariement glouton par fusion"
collection: publications
permalink: /fr/publications/p6
date: 2026-02-01
venue: 'Computers , Numéro spécial : Avancées récentes en réseaux sociaux et médias sociaux'
paperurl: 'https://doi.org/10.3390/computers15020083'
citation: 'Harutyunyan, H.A.; Kamalipour, P. Spider Community Detection: Seeded Geodesic Expansion with Modularity-Guided Refinement and Greedy Merge Matching. Computers 2026, 15, 83. https://doi.org/10.3390/computers15020083'
lang: fr-CA
gallery:
  - url: /images/Computers2026-screenshot.png
    image_path: /images/Computers2026-screenshot.png
    alt: "capture d'écran"
    title: "capture d'écran"
---
{% include gallery caption="capture d'écran" %}
- Revue : Computers
- Numéro spécial : Avancées récentes en réseaux sociaux et médias sociaux
- DOI : [https://doi.org/10.3390/computers15020083](https://doi.org/10.3390/computers15020083)
- PDF de l’article : [Voir sur ResearchGate](https://www.researchgate.net/profile/Parsa-Kamalipour/publication/400410840_Spider_Community_Detection_Seeded_Geodesic_Expansion_with_Modularity-Guided_Refinement_and_Greedy_Merge_Matching/links/698bb00312f837212a1961b3/Spider-Community-Detection-Seeded-Geodesic-Expansion-with-Modularity-Guided-Refinement-and-Greedy-Merge-Matching.pdf)

## Résumé: 

La détection de communautés joue un rôle central dans la compréhension de la structure modulaire des réseaux complexes. Ce travail présente Spider Community Detection, un algorithme hybride local–global qui construit des communautés à l’aide d’un processus d’expansion géodésique à profondeur bornée. Chaque « spider » est initiée à partir d’un nœud graine structurellement fort, sélectionné à l’aide d’un score composite fondé sur le degré, la participation aux triangles et le coefficient de regroupement local. À partir de chaque graine, l’algorithme développe un sous-graphe local en forme de toile par exploration en largeur bornée, où les nœuds candidats sont évalués selon le gain réel de modularité ainsi qu’un signal de fermeture de triangles. Après la construction initiale des spiders, la méthode applique une étape d’attachement guidée par la modularité pour les sommets restants, un raffinement local de type Louvain, ainsi qu’un appariement glouton par fusion sous contraintes de conductance afin de concilier la structure locale avec la cohérence globale de la partition. Les évaluations expérimentales menées sur des jeux de données réels et de référence, notamment Karate Club, High School, Political Blogs, Cora et DBLP, montrent que Spider produit des partitions compétitives par rapport aux méthodes établies en termes de récupération de la vérité terrain et de qualité structurelle, tout en générant des communautés aux frontières nettes selon une évaluation sensible à la conductance.
