---
title: "Optimizing Graph Neural Networks for Scalable Community Detection"
type: "Evaluation of Scalable Training Strategies for Graph Neural Networks - Graduate Course Project"
venue: "Concordia University"
date: 2024-11-01
location: "Montreal, Quebec"
collection: projects
gallery:
  - url: /images/CommGNN.png
    image_path: /images/CommGNN.png
    alt: "Report Screenshot"
    title: "Report Screenshot"
---
-  Designed and implemented scalable GNN-based community detection pipelines using GCN and GraphSAGE architectures with full-batch training, neighbor sampling, and graph partitioning strategies.
- Conducted extensive experiments on SBM (1K, 10K), CORA, and Reddit datasets, demonstrating that neighbor sampling and graph partitioning enable training on large graphs where full-batch methods fail due to memory constraints.
- Achieved up to 90% accuracy on SBM (10K nodes) with graph partitioning while reducing memory footprint, and enabled scalable training on Reddit where full-batch methods resulted in out-of-memory failures.
- Analyzed trade-offs between accuracy, training time, and memory usage, providing practical guidelines for scalable GNN deployment in real-world large-scale social networks.
- Presentation Slides [Click here](/files/Projects/ComGNN_Project_Presentation.pdf)
- Project Proposal [Click here](/files/Projects/ComGNN_Project_Proposal.pdf)
- Project Report [Click here](/files/Projects/ComGNN_Project_Report.pdf)
- Codes and GitHub Repository: [Click here](https://github.com/Fall2024-MLProjects/CommunityDetection/tree/main)
{% include gallery caption="Report Screenshot" %}
