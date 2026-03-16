---
title: "Minimum-Cost Flow Algorithms on Randomized Source–Sink Networks"
type: "Experimental Study of Network Flow Optimization Algorithms - Graduate Course Project"
venue: "Concordia University"
date: 2024-11-01
location: "Montreal, Quebec"
collection: projects
gallery:
  - url: /images/MinFlow.png
    image_path: /images/MinFlow.png
    alt: "Report Screenshot"
    title: "Report Screenshot"
---
-  Implemented the Successive Shortest Path algorithm from scratch, including residual graph construction, Bellman–Ford based minimum-cost path extraction, and flow augmentation logic.
- Designed and executed large-scale experimental evaluation on randomized Euclidean directed graphs across 28 configurations with varying density (𝑟), capacity bounds, and cost regimes.
- Compared SSP, Capacity Scaling, Scaling-SSP, and Primal–Dual algorithms using metrics including total cost, flow value, number of augmenting paths, mean path length, and proportional path length.
- Demonstrated that the Primal–Dual algorithm consistently achieves optimal minimum cost, while SSP achieves competitive performance in sparse regimes and degrades in dense graphs.
- Project Report [Click here](/files/Projects/MinFlow_Report.pdf)
- Codes and GitHub Repository: [Click here](https://github.com/COMP6651-ADT-Project-Fall2024/minimum-cost-flow)
{% include gallery caption="Report Screenshot" %}
