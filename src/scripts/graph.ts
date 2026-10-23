/**
 * Homepage hero: a planted-partition random graph, laid out by a tiny force simulation
 * while asynchronous label propagation discovers its communities.
 * Markup: <figure class="hero-graph"><canvas> … <span class="hero-graph__status"
 * data-searching="…" data-found="… {n} …"> … <button class="hero-graph__again">
 */
type Node = { x: number; y: number; vx: number; vy: number; block: number; label: number };

// Community colours per theme: deeper inks on paper, pastels on the night slate
const PALETTES = {
  light: ['47, 85, 212', '22, 140, 100', '196, 70, 128', '196, 128, 10', '122, 82, 204'],
  dark: ['147, 172, 255', '124, 196, 164', '227, 154, 184', '242, 193, 78', '190, 160, 255'],
};
const K = 4, PER = 14, P_IN = 0.5, P_OUT = 0.012;

export function initHeroGraph(prefersReducedMotion: boolean) {
  const fig = document.querySelector('.hero-graph');
  const canvas = fig?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!fig || !canvas || !ctx) return;
  const status = fig.querySelector('.hero-graph__status');
  const again = fig.querySelector('.hero-graph__again');

  let palette = PALETTES.light, ink = '40, 50, 70';
  function readTheme() {
    const css = getComputedStyle(document.documentElement);
    palette = /dark/.test(css.colorScheme) ? PALETTES.dark : PALETTES.light;
    ink = css.getPropertyValue('--graph-ink').trim() || ink;
  }

  let W = 0, H = 0;
  let nodes: Node[] = [], edges: [number, number][] = [], adj: number[][] = [];
  let labelColor: Record<number, number> = {};
  let converged = false, frame = 0, raf = 0, visible = true, energy = Infinity;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas!.clientWidth;
    H = canvas!.clientHeight;
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    const n = K * PER;
    nodes = []; edges = []; adj = []; labelColor = {};
    converged = false;
    energy = Infinity;
    for (let i = 0; i < n; i++) {
      nodes.push({ x: W * (0.2 + 0.6 * Math.random()), y: H * (0.15 + 0.7 * Math.random()), vx: 0, vy: 0, block: Math.floor(i / PER), label: i });
      adj.push([]);
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const p = nodes[i].block === nodes[j].block ? P_IN : P_OUT;
        if (Math.random() < p) { edges.push([i, j]); adj[i].push(j); adj[j].push(i); }
      }
    }
    // Isolated nodes never get a label from anyone — tie each to its own block
    for (let i = 0; i < n; i++) {
      if (!adj[i].length) {
        const j = nodes[i].block * PER + ((i + 1) % PER);
        edges.push([i, j]); adj[i].push(j); adj[j].push(i);
      }
    }
    setStatus(false);
  }

  // Force step: all-pairs repulsion, edge springs, gentle pull to centre
  function physics() {
    const n = nodes.length, rep = (W * H) / 650;
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const f = rep / (dx * dx + dy * dy + 0.01);
        a.vx += (dx * f) / 60; a.vy += (dy * f) / 60;
        b.vx -= (dx * f) / 60; b.vy -= (dy * f) / 60;
      }
    }
    const rest = Math.min(W, H) * 0.12;
    for (const [i, j] of edges) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - rest) * 0.012;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
    }
    energy = 0;
    for (const nd of nodes) {
      nd.vx += (W / 2 - nd.x) * 0.0012;
      nd.vy += (H / 2 - nd.y) * 0.006;
      nd.vx *= 0.82; nd.vy *= 0.82;
      nd.x = Math.max(8, Math.min(W - 8, nd.x + nd.vx));
      nd.y = Math.max(8, Math.min(H - 8, nd.y + nd.vy));
      energy += nd.vx * nd.vx + nd.vy * nd.vy;
    }
  }

  function topLabels(i: number) {
    const count: Record<number, number> = {};
    let best = 0;
    for (const j of adj[i]) {
      const l = nodes[j].label;
      count[l] = (count[l] || 0) + 1;
      if (count[l] > best) best = count[l];
    }
    return Object.keys(count).filter((l) => count[+l] === best).map(Number);
  }

  // One asynchronous LPA sweep in random order; returns whether any label changed
  function lpaSweep() {
    const order = nodes.map((_, i) => i);
    for (let k = order.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [order[k], order[r]] = [order[r], order[k]];
    }
    let changed = false;
    for (const i of order) {
      const top = topLabels(i);
      if (top.includes(nodes[i].label)) continue;
      nodes[i].label = top[Math.floor(Math.random() * top.length)];
      changed = true;
    }
    return changed;
  }

  const communities = () => new Set(nodes.map((nd) => nd.label)).size;

  // Labels held by 3+ nodes get a colour; a dying label frees its colour so two live
  // communities never share one
  function assignColors() {
    const size: Record<number, number> = {}, used: Record<number, boolean> = {};
    for (const nd of nodes) size[nd.label] = (size[nd.label] || 0) + 1;
    for (const l in labelColor) {
      if ((size[l] || 0) < 3) delete labelColor[l];
      else used[labelColor[l]] = true;
    }
    for (const l of Object.keys(size).map(Number).sort((a, b) => size[b] - size[a])) {
      if (size[l] < 3 || l in labelColor) continue;
      // Store palette slots, not colours, so a theme switch just repaints
      for (let k = 0; k < PALETTES.light.length; k++) {
        if (!used[k]) { labelColor[l] = k; used[k] = true; break; }
      }
    }
  }

  function draw() {
    ctx!.clearRect(0, 0, W, H);
    assignColors();
    const col = (l: number) => (l in labelColor ? palette[labelColor[l]] : null);
    ctx!.lineWidth = 1;
    for (const [i, j] of edges) {
      const a = nodes[i], b = nodes[j];
      const c = a.label === b.label ? col(a.label) : null;
      ctx!.strokeStyle = c ? `rgba(${c}, 0.4)` : `rgba(${ink}, 0.12)`;
      ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
    }
    nodes.forEach((nd, i) => {
      const c = col(nd.label);
      ctx!.fillStyle = c ? `rgb(${c})` : `rgba(${ink}, 0.45)`;
      ctx!.beginPath();
      ctx!.arc(nd.x, nd.y, 2.6 + Math.min(adj[i].length, 8) * 0.28, 0, Math.PI * 2);
      ctx!.fill();
    });
  }

  function setStatus(done: boolean) {
    if (!status) return;
    status.textContent = done
      ? (status.getAttribute('data-found') ?? '').replace('{n}', String(communities()))
      : status.getAttribute('data-searching');
  }

  const settled = () => converged && energy < 0.02;

  function tick() {
    raf = 0;
    frame++;
    physics();
    // Let the layout untangle a little before the labels start moving
    if (!converged && frame > 40 && frame % 14 === 0) {
      converged = !lpaSweep();
      if (converged) setStatus(true);
    }
    draw();
    if (settled()) return; // stop burning CPU
    if (visible) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    resize();
    build();
    frame = 0;
    if (prefersReducedMotion) {
      for (let i = 0; i < 400; i++) physics();
      while (lpaSweep()) { /* run to convergence */ }
      converged = true;
      setStatus(true);
      draw();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !raf && !settled() && !prefersReducedMotion) raf = requestAnimationFrame(tick);
  }).observe(canvas);

  let lastW = canvas.clientWidth;
  addEventListener('resize', () => {
    if (canvas.clientWidth === lastW) return; // ignore mobile URL-bar height jitter
    lastW = canvas.clientWidth;
    start();
  });
  again?.addEventListener('click', start);
  document.addEventListener('themechange', () => { readTheme(); draw(); });
  readTheme();
  start();
}
