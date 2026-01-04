/**
 * Custom JavaScript enhancements for improved user experience
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Add smooth scrolling to anchor links
    addSmoothScrolling();
    
    // Enhance external links
    enhanceExternalLinks();
    
    // Add copy to clipboard for code blocks
    addCopyCodeButtons();
    
    // Improve focus management for skip links
    enhanceSkipLinks();
    
    // Add scroll to top button
    addScrollToTopButton();
    
    // Lazy load images with fade-in effect
    enhanceLazyLoading();
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
            behavior: 'smooth',
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
          target.focus();
        }
      });
    });
  }

  /**
   * Enhance external links with security and UX improvements
   */
  function enhanceExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      const url = new URL(link.href);
      if (url.hostname !== window.location.hostname) {
        // Add security attributes
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add visual indicator (optional, can be styled with CSS)
        link.classList.add('external-link');
        
        // Add accessible title if not present
        if (!link.getAttribute('title')) {
          link.setAttribute('title', `Opens in new window: ${link.textContent}`);
        }
      }
    });
  }

  /**
   * Add copy buttons to code blocks
   */
  function addCopyCodeButtons() {
    // Use more generic selectors for better compatibility
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
          
          // Use modern clipboard API with fallback
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
            // Fallback for older browsers
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
      if (successful) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      } else {
        button.textContent = 'Failed';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      button.textContent = 'Failed';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    }
    
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
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
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
    
    // Show/hide button based on scroll position
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
    });
    
    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Enhance lazy loading with fade-in effect
   */
  function enhanceLazyLoading() {
    // Use Intersection Observer for better performance
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
   * Add keyboard navigation enhancements
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
