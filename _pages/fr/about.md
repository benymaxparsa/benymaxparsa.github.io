---
permalink: /fr/
lang: fr-CA
title: "Parsa Kamalipour"
excerpt: "À propos de moi"
classes: home
redirect_from:
  - /fr/accueil/
  - /fr/a-propos/
---

<section class="home-hero" aria-label="Présentation">
  <div class="home-hero__text">
    <div class="home-hero__id">
      {% include home-photo.html alt="Portrait de Parsa Kamalipour" %}
      <p class="home-hero__role">Maîtrise en informatique<br>Laboratoire d'algorithmes et de complexité, Université Concordia</p>
    </div>

    <p class="page__lead">Parsa étudie la détection de communautés dans les réseaux sociaux et complexes : trouver les groupes cachés dans un graphe, et juger s'ils sont réels, à l'aide d'outils issus de l'algorithmique et de la théorie des graphes. Il est étudiant à la maîtrise avec mémoire à l'<a href="https://www.concordia.ca/ginacody/computer-science-software-eng.html">Université Concordia</a> à Montréal, sous la supervision du <a href="https://users.encs.concordia.ca/~haruty/">professeur Hovhannes Harutyunyan</a>.</p>

    <div class="hero-actions">
      <a class="hero-btn hero-btn--primary" href="/files/FR_ParsaKamalipour_CV.pdf"><i class="fas fa-download" aria-hidden="true"></i> Télécharger le CV</a>
      <a class="hero-btn hero-btn--ghost" href="/fr/contact/"><i class="fas fa-envelope" aria-hidden="true"></i> Me joindre</a>
    </div>

    {% include profile-links.html email_label="Courriel" %}
  </div>

  <figure class="hero-graph">
    <canvas role="img" aria-label="Un réseau aléatoire de 56 nœuds répartis en quatre groupes cachés. La propagation d'étiquettes colore chaque groupe à mesure qu'elle le trouve."></canvas>
    <figcaption>
      <span class="hero-graph__status" data-searching="La propagation d'étiquettes cherche des communautés…" data-found="La propagation d'étiquettes a trouvé {n} communautés dans un graphe aléatoire à partition plantée." aria-live="polite">La propagation d'étiquettes cherche des communautés…</span>
      <button type="button" class="hero-graph__again">Nouveau graphe</button>
    </figcaption>
  </figure>
</section>

<h2 class="section-heading section-heading--first" id="recherche">Recherche</h2>

Son mémoire, ***Geodesic-Compact Community Detection and Quality Assessment in Social Networks*** (achèvement prévu en 2027), part d'une idée simple : les membres d'une bonne communauté sont proches les uns des autres en distance de plus court chemin, comparativement au reste du réseau. Cela permet de détecter et d'évaluer des communautés sans étiquettes de référence. Ces travaux ont déjà donné **Spider**, un algorithme de détection de communautés en temps quasi linéaire qui combine des étapes locales et globales (*Computers*, 2026), et une étude, en premier auteur, de la **modularité de distance géodésique moyenne pondérée (wGDM)** combinée à la sparsification par Metric Backbone comme prétraitement pour Leiden (*IEEE SNAMS 2025*, présentée à Vienne). [Lire la biographie complète](/fr/biographie/)

<ul class="interest-tags" aria-label="Intérêts de recherche">
  <li class="interest-tag">Théorie des graphes</li>
  <li class="interest-tag">Algorithmes</li>
  <li class="interest-tag">Théorie de la complexité</li>
  <li class="interest-tag">Analyse de réseaux sociaux</li>
  <li class="interest-tag">Détection de communautés</li>
  <li class="interest-tag">Optimisation combinatoire</li>
  <li class="interest-tag">Exploration de données</li>
</ul>

<dl class="stats-band" aria-label="Profil académique en un coup d'œil">
  <div class="stat-card"><dt class="stat-card__label">Publications</dt><dd class="stat-card__number">4</dd></div>
  <div class="stat-card"><dt class="stat-card__label">Cours assistés</dt><dd class="stat-card__number">15+</dd></div>
  <div class="stat-card"><dt class="stat-card__label">Heures d'enseignement</dt><dd class="stat-card__number">1650+</dd></div>
  <div class="stat-card"><dt class="stat-card__label">Postes de recherche</dt><dd class="stat-card__number">3</dd></div>
</dl>

<h2 class="section-heading" id="nouvelles">Nouvelles récentes</h2>

<ol class="news-list">
  <li>
    <time datetime="2026-09">sept. 2026</time>
    <p>Auxiliaire d'enseignement pour quatre cours cet automne : COEN 311, COEN 317, SOEN 363 et COMP 339.</p>
  </li>
  <li>
    <time datetime="2026-05">mai 2026</time>
    <p>Lauréat du <strong>Dean’s Excellence Award for Excellence in Teaching by a Teaching Assistant</strong>, décerné par l'École de génie et d'informatique Gina-Cody.</p>
  </li>
  <li>
    <time datetime="2026-02">févr. 2026</time>
    <p>« Spider Community Detection: Seeded Geodesic Expansion with Modularity-Guided Refinement and Greedy Merge Matching » est publié dans <em>Computers</em> 15(2), article 83. <a href="https://doi.org/10.3390/computers15020083">Lire l'article</a></p>
  </li>
  <li>
    <time datetime="2025-11">nov. 2025</time>
    <p>« From Dense Graphs to Meaningful Communities » présenté à IEEE SNAMS 2025 à Vienne.</p>
  </li>
</ol>

<p class="news-list__more"><a href="/fr/nouvelles/">Toutes les nouvelles</a></p>

{% assign mois_index = site.time | date: "%-m" | minus: 1 %}
{% assign mois_fr = "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre" | split: "," %}
<p class="page__updated">Dernière mise à jour : {{ site.time | date: "%-d" }} {{ mois_fr[mois_index] }} {{ site.time | date: "%Y" }}</p>
