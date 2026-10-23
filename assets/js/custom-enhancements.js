/**
 * Custom JavaScript enhancements for improved user experience
 */

(function() {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    addSmoothScrolling();
    enhanceExternalLinks();
    addCopyCodeButtons();
    enhanceSkipLinks();
    addReadingProgressBar();
    addScrollToTopButton();
    initThemeToggle();
    enhanceNavMenu();
    addHeroGraph();
    enhanceLazyLoading();
    addSearchShortcut();
    recalcNavAfterFonts();
    updateDurations();
  }

  /**
   * The greedy nav measures link widths on load; custom web fonts arriving
   * later change those widths and leave the masthead overlapping on phones.
   * Re-trigger its resize handler once fonts are ready.
   */
  function recalcNavAfterFonts() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  /**
   * Auto-updating "X yrs Y mos" durations (LinkedIn-style, inclusive months)
   * for elements like <span class="teaching-duration" data-start="2024-09">.
   * Static text in the markup stays as the no-JS fallback.
   */
  function updateDurations() {
    var nodes = document.querySelectorAll('.teaching-duration[data-start]');
    if (!nodes.length) return;

    var now = new Date();
    var isFrench = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;

    nodes.forEach(function(el) {
      var start = (el.getAttribute('data-start') || '').split('-');
      var startY = parseInt(start[0], 10);
      var startM = parseInt(start[1], 10);
      if (!startY || !startM) return;

      var end = (el.getAttribute('data-end') || '').split('-');
      var endY = parseInt(end[0], 10) || now.getFullYear();
      var endM = parseInt(end[1], 10) || now.getMonth() + 1;

      var months = (endY - startY) * 12 + (endM - startM) + 1;
      if (months < 1) return;

      var yrs = Math.floor(months / 12);
      var mos = months % 12;
      var parts = [];
      if (isFrench) {
        if (yrs) parts.push(yrs + (yrs > 1 ? ' ans' : ' an'));
        if (mos) parts.push(mos + ' mois');
      } else {
        if (yrs) parts.push(yrs + (yrs > 1 ? ' yrs' : ' yr'));
        if (mos) parts.push(mos + (mos > 1 ? ' mos' : ' mo'));
      }
      if (parts.length) el.textContent = parts.join(' ');
    });
  }

  /**
   * Add smooth scrolling to all anchor links
   */
  function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });

          // Set focus for keyboard users only if target isn't naturally focusable
          if (!target.hasAttribute('tabindex') &&
              !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
            target.setAttribute('tabindex', '-1');
            // Remove tabindex after focus to restore natural tab order
            target.addEventListener('blur', function() {
              target.removeAttribute('tabindex');
            }, { once: true });
          }
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /**
   * Enhance external links: open in a new tab with safe rel attributes,
   * preserving any existing rel values (e.g. rel="me" identity links).
   */
  function enhanceExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      let url;
      try {
        url = new URL(link.href);
      } catch (e) {
        return;
      }
      if (url.hostname === window.location.hostname) return;

      const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(token => {
        if (!rel.includes(token)) rel.push(token);
      });
      link.setAttribute('rel', rel.join(' '));

      if (!link.hasAttribute('target')) {
        link.setAttribute('target', '_blank');
      }

      link.classList.add('external-link');

      if (!link.getAttribute('title')) {
        const label = (link.textContent || '').trim() || url.hostname;
        link.setAttribute('title', 'Opens in new tab: ' + label);
      }
    });
  }

  /**
   * Add copy buttons to code blocks
   */
  function addCopyCodeButtons() {
    const codeBlocks = document.querySelectorAll('pre code, pre.highlight, pre[class*="language-"]');

    codeBlocks.forEach(codeElement => {
      const pre = codeElement.tagName === 'PRE' ? codeElement : codeElement.parentElement;
      if (!pre || pre.querySelector('.copy-code-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-code-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');

      button.addEventListener('click', function() {
        const code = pre.querySelector('code') || pre;
        if (code) {
          const text = code.textContent;

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
              button.textContent = 'Copied!';
              setTimeout(() => {
                button.textContent = 'Copy';
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
              fallbackCopy(text, button);
            });
          } else {
            fallbackCopy(text, button);
          }
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  }

  /**
   * Fallback copy method for browsers without Clipboard API
   * Note: document.execCommand is deprecated but kept for legacy browser support
   */
  function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      button.textContent = successful ? 'Copied!' : 'Failed';
    } catch (err) {
      console.error('Fallback copy failed:', err);
      button.textContent = 'Failed';
    }
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);

    document.body.removeChild(textArea);
  }

  /**
   * Enhance skip links functionality
   */
  function enhanceSkipLinks() {
    document.querySelectorAll('.skip-links a').forEach(link => {
      link.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  /**
   * Thin reading-progress bar across the top of the viewport
   */
  function addReadingProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /**
   * Add scroll to top button
   */
  function addScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Scroll to top');
    button.style.display = 'none';

    document.body.appendChild(button);

    let isVisible = false;
    window.addEventListener('scroll', function() {
      const shouldShow = window.scrollY > 300;

      if (shouldShow && !isVisible) {
        button.style.display = 'block';
        setTimeout(() => button.classList.add('visible'), 10);
        isVisible = true;
      } else if (!shouldShow && isVisible) {
        button.classList.remove('visible');
        setTimeout(() => button.style.display = 'none', 300);
        isVisible = false;
      }
    }, { passive: true });

    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /**
   * Overflow ("more") menu: the theme only closes it via its own button, and its
   * mouseleave timer hides the list while leaving the button as an "x". Keep the
   * button in sync with the list, expose the state, and close on Esc / outside tap.
   */
  function enhanceNavMenu() {
    var toggle = document.querySelector('.greedy-nav__toggle');
    var menu = document.querySelector('.greedy-nav .hidden-links');
    if (!toggle || !menu) return;
    menu.id = menu.id || 'site-menu';
    toggle.setAttribute('aria-controls', menu.id);

    function isOpen() { return !menu.classList.contains('hidden'); }
    function sync() {
      toggle.classList.toggle('close', isOpen());
      toggle.setAttribute('aria-expanded', String(isOpen()));
    }

    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        menu.classList.add('hidden');
        toggle.focus();
      }
    });
    document.addEventListener('click', function(e) {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) menu.classList.add('hidden');
    });
    sync();
  }

  /**
   * Light/dark switch. With no saved choice the CSS follows the system; a click
   * pins the opposite of whatever is showing (head.html re-applies it before
   * paint on later pages). Fires a "themechange" event for canvas redraws.
   */
  function initThemeToggle() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var root = document.documentElement;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');

    function current() {
      return root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light');
    }

    function sync() {
      var dark = current() === 'dark';
      btn.setAttribute('aria-label', btn.getAttribute(dark ? 'data-label-light' : 'data-label-dark'));
      btn.setAttribute('title', btn.getAttribute('aria-label'));
      document.querySelectorAll('meta[name="theme-color"]').forEach(function(m) {
        m.setAttribute('content', dark ? '#121821' : '#f7f8fa');
      });
      document.dispatchEvent(new CustomEvent('themechange'));
    }

    btn.addEventListener('click', function() {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });

    var onSystemChange = function() { if (!root.getAttribute('data-theme')) sync(); };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
    sync();
  }

  /**
   * Homepage hero: a planted-partition random graph, laid out by a tiny force
   * simulation while asynchronous label propagation discovers its communities.
   * Markup: <figure class="hero-graph"><canvas> … <span class="hero-graph__status"
   * data-searching="…" data-found="… {n} …"> … <button class="hero-graph__again">
   */
  function addHeroGraph() {
    var fig = document.querySelector('.hero-graph');
    if (!fig) return;
    var canvas = fig.querySelector('canvas');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var status = fig.querySelector('.hero-graph__status');
    var again = fig.querySelector('.hero-graph__again');

    // Community colours per theme: deeper inks on paper, pastels on the night slate
    var PALETTES = {
      light: ['47, 85, 212', '22, 140, 100', '196, 70, 128', '196, 128, 10', '122, 82, 204'],
      dark: ['147, 172, 255', '124, 196, 164', '227, 154, 184', '242, 193, 78', '190, 160, 255']
    };
    var palette = PALETTES.light, ink = '40, 50, 70';

    function readTheme() {
      var css = getComputedStyle(document.documentElement);
      palette = /dark/.test(css.colorScheme) ? PALETTES.dark : PALETTES.light;
      ink = css.getPropertyValue('--graph-ink').trim() || ink;
    }
    var K = 4, PER = 14, P_IN = 0.5, P_OUT = 0.012;

    var W = 0, H = 0, nodes = [], edges = [], adj = [], labelColor = {};
    var converged = false, frame = 0, raf = 0, visible = true, energy = Infinity;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      var n = K * PER, i, j;
      nodes = [];
      edges = [];
      adj = [];
      labelColor = {};
      converged = false;
      energy = Infinity;
      for (i = 0; i < n; i++) {
        nodes.push({ x: W * (0.2 + 0.6 * Math.random()), y: H * (0.15 + 0.7 * Math.random()),
          vx: 0, vy: 0, block: Math.floor(i / PER), label: i });
        adj.push([]);
      }
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var p = nodes[i].block === nodes[j].block ? P_IN : P_OUT;
          if (Math.random() < p) { edges.push([i, j]); adj[i].push(j); adj[j].push(i); }
        }
      }
      // Isolated nodes never get a label from anyone — tie each to its own block
      for (i = 0; i < n; i++) {
        if (!adj[i].length) {
          j = nodes[i].block * PER + ((i + 1) % PER);
          edges.push([i, j]); adj[i].push(j); adj[j].push(i);
        }
      }
      setStatus(false);
    }

    // Force step: all-pairs repulsion, edge springs, gentle pull to centre
    function physics() {
      var n = nodes.length, i, j, a, b, dx, dy, d2, f;
      var rep = W * H / 650;
      for (i = 0; i < n; i++) {
        a = nodes[i];
        for (j = i + 1; j < n; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d2 = dx * dx + dy * dy + 0.01;
          f = rep / d2;
          a.vx += dx * f / 60; a.vy += dy * f / 60;
          b.vx -= dx * f / 60; b.vy -= dy * f / 60;
        }
      }
      var rest = Math.min(W, H) * 0.12;
      edges.forEach(function(e) {
        a = nodes[e[0]]; b = nodes[e[1]];
        dx = b.x - a.x; dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        f = (d - rest) * 0.012;
        a.vx += dx / d * f; a.vy += dy / d * f;
        b.vx -= dx / d * f; b.vy -= dy / d * f;
      });
      energy = 0;
      nodes.forEach(function(nd) {
        nd.vx += (W / 2 - nd.x) * 0.0012;
        nd.vy += (H / 2 - nd.y) * 0.006;
        nd.vx *= 0.82; nd.vy *= 0.82;
        nd.x = Math.max(8, Math.min(W - 8, nd.x + nd.vx));
        nd.y = Math.max(8, Math.min(H - 8, nd.y + nd.vy));
        energy += nd.vx * nd.vx + nd.vy * nd.vy;
      });
    }

    function topLabels(i) {
      var count = {}, best = 0, out = [];
      adj[i].forEach(function(j) {
        var l = nodes[j].label;
        count[l] = (count[l] || 0) + 1;
        if (count[l] > best) best = count[l];
      });
      Object.keys(count).forEach(function(l) { if (count[l] === best) out.push(+l); });
      return out;
    }

    // One asynchronous LPA sweep in random order; returns whether any label changed
    function lpaSweep() {
      var order = nodes.map(function(_, i) { return i; });
      for (var k = order.length - 1; k > 0; k--) {
        var r = Math.floor(Math.random() * (k + 1)), t = order[k];
        order[k] = order[r]; order[r] = t;
      }
      var changed = false;
      order.forEach(function(i) {
        var top = topLabels(i);
        if (top.indexOf(nodes[i].label) !== -1) return;
        nodes[i].label = top[Math.floor(Math.random() * top.length)];
        changed = true;
      });
      return changed;
    }

    function communities() {
      var seen = {};
      nodes.forEach(function(nd) { seen[nd.label] = 1; });
      return Object.keys(seen).length;
    }

    // Labels held by 3+ nodes get a colour; a dying label frees its colour so
    // two live communities never share one
    function assignColors() {
      var size = {}, l, used = {};
      nodes.forEach(function(nd) { size[nd.label] = (size[nd.label] || 0) + 1; });
      for (l in labelColor) {
        if ((size[l] || 0) < 3) delete labelColor[l];
        else used[labelColor[l]] = 1;
      }
      Object.keys(size).sort(function(a, b) { return size[b] - size[a]; }).forEach(function(l) {
        if (size[l] < 3 || l in labelColor) return;
        // Store palette slots, not colours, so a theme switch just repaints
        for (var k = 0; k < PALETTES.light.length; k++) {
          if (!used[k]) { labelColor[l] = k; used[k] = 1; break; }
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      assignColors();
      function col(l) { return l in labelColor ? palette[labelColor[l]] : null; }
      ctx.lineWidth = 1;
      edges.forEach(function(e) {
        var a = nodes[e[0]], b = nodes[e[1]];
        var c = a.label === b.label ? col(a.label) : null;
        ctx.strokeStyle = c ? 'rgba(' + c + ', 0.4)' : 'rgba(' + ink + ', 0.12)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      nodes.forEach(function(nd, i) {
        var c = col(nd.label);
        ctx.fillStyle = c ? 'rgb(' + c + ')' : 'rgba(' + ink + ', 0.45)';
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 2.6 + Math.min(adj[i].length, 8) * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function setStatus(done) {
      if (!status) return;
      status.textContent = done
        ? (status.getAttribute('data-found') || '').replace('{n}', communities())
        : status.getAttribute('data-searching');
    }

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
      if (converged && energy < 0.02) return; // settled: stop burning CPU
      if (visible) raf = requestAnimationFrame(tick);
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      resize();
      build();
      frame = 0;
      if (prefersReducedMotion) {
        for (var i = 0; i < 400; i++) physics();
        while (lpaSweep()) { /* run to convergence */ }
        converged = true;
        setStatus(true);
        draw();
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf && !(converged && energy < 0.02) && !prefersReducedMotion) {
          raf = requestAnimationFrame(tick);
        }
      }).observe(canvas);
    }

    var lastW = 0;
    window.addEventListener('resize', function() {
      if (canvas.clientWidth === lastW) return; // ignore mobile URL-bar height jitter
      lastW = canvas.clientWidth;
      start();
    });
    if (again) again.addEventListener('click', start);
    document.addEventListener('themechange', function() { readTheme(); draw(); });
    readTheme();
    lastW = canvas.clientWidth;
    start();
  }

  /**
   * Enhance lazy loading with fade-in effect
   */
  function enhanceLazyLoading() {
    // Fade-in for natively lazy-loaded images that haven't arrived yet
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete) return;
      img.classList.add('lazy-fade');
      const markLoaded = () => img.classList.add('loaded');
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true });
    });

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Press "/" anywhere to open site search
   */
  function addSearchShortcut() {
    document.addEventListener('keydown', function(e) {
      // Esc closes the search overlay and hands focus back to its button
      if (e.key === 'Escape') {
        const panel = document.querySelector('.search-content.is--visible');
        const searchToggle = document.querySelector('.search__toggle');
        if (panel && searchToggle) {
          searchToggle.click();
          searchToggle.focus();
        }
        return;
      }

      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;

      const active = document.activeElement;
      if (active && (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)) {
        return;
      }

      const toggle = document.querySelector('.search__toggle');
      if (toggle) {
        e.preventDefault();
        toggle.click();
        const searchInput = document.querySelector('.search-content input[type="search"]');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    });
  }

})();
