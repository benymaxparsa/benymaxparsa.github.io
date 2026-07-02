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
    addScrollReveal();
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
   * Subtle reveal-on-scroll animation for cards and list items
   */
  function addScrollReveal() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    // News entries are excluded: fading them in as you scroll read as lag,
    // especially on phones — they now render instantly.
    const targets = document.querySelectorAll(
      '.quick-link, .stat-card, .list__item, .teaching-role, .contact-links li'
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      // Start revealing well before the element enters the viewport so the
      // next card is already visible as you scroll toward it
      rootMargin: '0px 0px 200px 0px',
      threshold: 0
    });

    targets.forEach((el, i) => {
      // Skip elements already in the initial viewport to avoid a flash of hidden content
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) return;
      el.classList.add('reveal');
      observer.observe(el);
    });
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

  /**
   * Keyboard niceties
   */
  document.addEventListener('keydown', function(e) {
    // Allow ESC key to blur current element
    if (e.key === 'Escape') {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  });

})();
