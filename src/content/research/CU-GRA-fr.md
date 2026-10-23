---
title: "Assistant de recherche diplômé"
collection: research
type: "Niveau des études supérieures"
permalink: /fr/recherche/CU-GRA
venue: "Université Concordia, Laboratoire d'algorithmes et de complexité, Département d'informatique et de génie logiciel"
date: 2024-08-17
location: "Montréal, Québec, Canada"
lang: fr-CA
---

- Recherche en conception et analyse d'algorithmes, théorie des graphes et analyse de réseaux sociaux
- Travail au Laboratoire d'algorithmes et de complexité
- Sous la supervision du professeur Hovhannes Harutyunyan
- Date : Août 2024 -- Présent
- Mon rôle principal consistait à :
    - Concevoir Spider, un algorithme de détection de communautés dans les graphes combinant une expansion géodésique, un raffinement guidé par la modularité et un appariement glouton par fusion.
    - Évaluer les performances de Spider face à Louvain, Leiden, Infomap, CNM et Label Propagation sur neuf réseaux réels (de 34 à 8 035 sommets) et des bancs d’essai LFR, obtenant les meilleurs scores F1 et ARI sur Karate Club et Political Blogs ainsi qu’un NMI de 0,88 sur Primary School, là où les méthodes fondées sur le flot et la propagation se réduisent à des partitions quasi triviales.
    - Proposer la modularité moyenne pondérée par distance géodésique (wGDM), une mesure de qualité de partition sans étiquettes et robuste à la taille des communautés.
    - Mener la première étude systématique de la sparsification par metric backbone combinée à Leiden, obtenant une réduction de 14 à 71 % des arêtes sur sept réseaux tout en préservant — et, sur les réseaux de contacts denses, en améliorant — la qualité de détection (F1 sur High School : 0,834 → 0,970).
    - Mettre en place un pipeline expérimental entièrement reproductible, incluant des graines aléatoires fixes, des implémentations de référence et des scripts d’évaluation automatisés.
- Nous avons publié deux articles à ce jour : la [conférence IEEE SNAMS 2025[1]](/fr/publications/p5) et la [revue Computers[2]](/fr/publications/p6)