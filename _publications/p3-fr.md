---
title: "Extension de la détection de réusinage à Kotlin : Un ensemble de données et une étude comparative"
collection: publications
permalink: /fr/publications/p3
date: 2024-01-11
venue: 'Actes de la 31e Conférence internationale IEEE sur l''analyse, l''évolution et la réingénierie de logiciels'
paperurl: 'http://dx.doi.org/10.1109/SANER60148.2024.00034'
citation: 'I. H. Moghadam, M. M. Afkhami, P. Kamalipour and V. Zaytsev, "Extending Refactoring Detection to Kotlin: A Dataset and Comparative Study," 2024 IEEE International Conference on Software Analysis, Evolution and Reengineering (SANER), Rovaniemi, Finland, 2024, pp. 267-271, doi: 10.1109/SANER60148.2024.00034.'
lang: fr-CA
gallery:
  - url: /images/SANER2024-screenshot.png
    image_path: /images/SANER2024-screenshot.png
    alt: "capture d'écran"
    title: "capture d'écran"
---
{% include gallery caption="capture d'écran" %}
- Conférence : La Conférence internationale IEEE sur l'analyse, l'évolution et la réingénierie de logiciels (SANER)
- DOI : http://dx.doi.org/10.1109/SANER60148.2024.00034
- Site Web de l'ensemble de données : https://sites.google.com/view/refdetectkotlin/home

## Résumé :

Le réusinage, en tant que l'une des meilleures pratiques en développement logiciel, a également été au centre de l'attention de nombreuses recherches. En particulier, une pléthore d'études ont été réalisées pour comprendre l'impact des réusinages sur différentes dimensions du développement logiciel, notamment la qualité du logiciel, la compréhension du programme, la propension aux défauts et les exigences non fonctionnelles, entre autres. Parmi les approches employées, l'analyse des réusinages appliqués précédemment dans des scénarios réels a été utilisée par de nombreux chercheurs et s'avère être un moyen précieux pour approfondir le sujet. Les résultats de ces études de recherche non seulement améliorent notre compréhension des avantages et des inconvénients potentiels des réusinages, mais nous guident également dans le développement d'outils de réusinage automatisés plus efficaces basés sur la façon dont les développeurs utilisent réellement les réusinages en pratique. Cependant, la majorité des études à cet égard se sont concentrées sur les réusinages appliqués dans les programmes Java, et les autres langages de programmation ont reçu nettement moins d'attention. En réalité, le manque d'ensembles de données complets de réusinages appliqués dans le monde réel rend difficile pour les chercheurs de mener des études complètes dans des langages de programmation autres que Java. L'obstacle principal peut être le manque de support d'outils automatisés pour identifier les réusinages appliqués dans les programmes implémentés dans d'autres langages.

Pour atténuer cette limitation, nous avons étendu un outil de détection de réusinage disponible précédemment, REFDETECT, pour être capable d'identifier les réusinages appliqués dans les programmes Kotlin. Nous avons mené une expérience sur 200 commits de 10 dépôts Kotlin provenant de GitHub et comparé les performances de notre outil avec un outil existant de détection de réusinage Kotlin appelé KOTLINRMINER. Nous avons constaté que notre outil a une précision de 90 % et un rappel de 82 %, atteignant un F-score moyen de 84 % qui est 17 % meilleur que celui obtenu par KOTLINRMINER. Nous fournissons également l'ensemble de données résultant contenant 2 043 vraies instances de réusinage détectées par au moins l'un des outils REFDETECT ou KOTLINRMINER et validées par un à trois experts en réusinage. En publiant cet ensemble de données initial, nous visons à combler le fossé existant dans la disponibilité des ensembles de données de réusinage Kotlin.
