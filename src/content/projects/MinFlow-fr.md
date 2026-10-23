---
title: "Algorithmes de flot à coût minimal sur des réseaux source–puits aléatoires"
type: "Étude expérimentale d’algorithmes d’optimisation de flots de réseau – Projet de cours aux cycles supérieurs"
venue: "Université Concordia"
date: 2024-11-01
location: "Montréal, Québec"
collection: projects
lang: fr-CA
---

- Implémentation de l’algorithme du plus court chemin successif (Successive Shortest Path) à partir de zéro, incluant la construction du graphe résiduel, l’extraction de chemins de coût minimal basée sur Bellman–Ford et la logique d’augmentation de flot.
- Conception et réalisation d’une évaluation expérimentale à grande échelle sur des graphes euclidiens orientés aléatoires selon 28 configurations, avec variation de la densité (𝑟), des bornes de capacité et des régimes de coûts.
- Comparaison des algorithmes SSP, mise à l’échelle des capacités (Capacity Scaling), Scaling-SSP et primal–dual à l’aide de métriques incluant le coût total, la valeur du flot, le nombre de chemins augmentants, la longueur moyenne des chemins et la longueur proportionnelle des chemins.
- Mise en évidence que l’algorithme primal–dual atteint systématiquement le coût minimal optimal, tandis que SSP offre des performances compétitives dans des régimes clairsemés et se dégrade dans les graphes denses.
- Rapport de projet [Cliquez ici](/files/Projects/MinFlow_Report.pdf)
- Code et dépôt GitHub : [Cliquez ici](https://github.com/COMP6651-ADT-Project-Fall2024/minimum-cost-flow)

<figure class=""><a href="/images/MinFlow.png" title="Capture d’écran du rapport"><img src="/images/MinFlow.png" loading="lazy" decoding="async" alt="Capture d’écran du rapport"></a><figcaption>Capture d’écran du rapport</figcaption></figure>
