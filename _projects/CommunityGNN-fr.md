---
title: "Optimisation des réseaux de neurones sur graphes pour la détection de communautés à grande échelle"
type: "Évaluation de stratégies d’entraînement évolutives pour les réseaux de neurones sur graphes – Projet de cours aux cycles supérieurs"
venue: "Université Concordia"
date: 2024-11-01
location: "Montréal, Québec"
collection: projects
lang: fr-CA
gallery:
  - url: /images/CommGNN.png
    image_path: /images/CommGNN.png
    alt: "Capture d’écran du rapport"
    title: "Capture d’écran du rapport"
---

- Conception et mise en œuvre de pipelines évolutifs de détection de communautés basés sur des GNN, utilisant les architectures GCN et GraphSAGE avec des stratégies d’entraînement en lot complet (full-batch), d’échantillonnage de voisins et de partitionnement de graphe.
- Réalisation d’expériences approfondies sur les ensembles de données SBM (1K, 10K), CORA et Reddit, démontrant que l’échantillonnage de voisins et le partitionnement de graphe permettent l’entraînement sur de grands graphes lorsque les méthodes en lot complet échouent en raison de contraintes mémoire.
- Atteinte d’une précision allant jusqu’à 90 % sur SBM (10K nœuds) avec le partitionnement de graphe tout en réduisant l’empreinte mémoire, et activation d’un entraînement évolutif sur Reddit où les méthodes en lot complet entraînaient des erreurs de mémoire insuffisante.
- Analyse des compromis entre précision, temps d’entraînement et utilisation de la mémoire, en proposant des lignes directrices pratiques pour le déploiement évolutif de GNN dans des réseaux sociaux de grande taille en contexte réel.
- Diapositives de présentation [Cliquez ici](/files/Projects/ComGNN_Project_Presentation.pdf)
- Proposition de projet [Cliquez ici](/files/Projects/ComGNN_Project_Proposal.pdf)
- Rapport de projet [Cliquez ici](/files/Projects/ComGNN_Project_Report.pdf)
- Code et dépôt GitHub : [Cliquez ici](https://github.com/Fall2024-MLProjects/CommunityDetection/tree/main)
{% include gallery caption="Capture d’écran du rapport" %}