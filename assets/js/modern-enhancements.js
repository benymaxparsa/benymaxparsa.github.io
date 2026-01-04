/**
 * Modern Website Enhancements
 * Features: Dark Mode, Language Toggle, Reading Progress, Enhanced Search, Social Sharing
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    darkModeKey: 'theme-preference',
    languageKey: 'site-language',
    defaultLanguage: 'en',
    availableLanguages: ['en', 'fr']
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Register service worker
    registerServiceWorker();
    
    // Initialize dark mode
    initDarkMode();
    
    // Initialize language switcher
    initLanguageSwitcher();
    
    // Initialize reading progress indicator
    initReadingProgress();
    
    // Enhance search functionality
    enhanceSearch();
    
    // Enhance social sharing
    enhanceSocialSharing();
    
    // Add modern UI enhancements
    addModernUIEffects();
  }

  /**
   * Register Service Worker for offline support
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registered:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  showUpdateNotification();
                }
              });
            });
          })
          .catch((error) => {
            console.log('ServiceWorker registration failed:', error);
          });
      });
    }
  }

  /**
   * Show notification for service worker update
   */
  function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <span>A new version is available!</span>
        <button id="sw-update-btn" class="btn btn--primary">Update</button>
        <button id="sw-dismiss-btn" class="btn btn--light">Dismiss</button>
      </div>
    `;
    document.body.appendChild(notification);

    document.getElementById('sw-update-btn').addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => notification.classList.add('visible'), 100);
  }

  /**
   * Initialize Dark Mode Toggle
   */
  function initDarkMode() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem(CONFIG.darkModeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Apply theme
    setTheme(currentTheme);

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'dark-mode-toggle';
    toggleBtn.className = 'theme-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
    toggleBtn.innerHTML = `
      <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    // Add to masthead if it exists
    const masthead = document.querySelector('.masthead__inner-wrap');
    if (masthead) {
      masthead.appendChild(toggleBtn);
    } else {
      document.body.appendChild(toggleBtn);
    }

    // Toggle theme on click
    toggleBtn.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem(CONFIG.darkModeKey, newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(CONFIG.darkModeKey)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set theme
   */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeColor(theme);
  }

  /**
   * Update theme color meta tag
   */
  function updateThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  }

  /**
   * Initialize Language Switcher
   */
  function initLanguageSwitcher() {
    const currentLang = localStorage.getItem(CONFIG.languageKey) || CONFIG.defaultLanguage;

    // Create language toggle
    const langToggle = document.createElement('div');
    langToggle.className = 'language-toggle';
    langToggle.innerHTML = `
      <button id="lang-toggle-btn" class="lang-toggle-btn" aria-label="Switch language">
        <span class="lang-icon">🌐</span>
        <span class="lang-text">${currentLang.toUpperCase()}</span>
      </button>
      <div id="lang-menu" class="lang-menu hidden">
        <button data-lang="en" class="lang-option ${currentLang === 'en' ? 'active' : ''}">
          English
        </button>
        <button data-lang="fr" class="lang-option ${currentLang === 'fr' ? 'active' : ''}">
          Français
        </button>
      </div>
    `;

    // Add to masthead
    const masthead = document.querySelector('.masthead__inner-wrap');
    if (masthead) {
      masthead.appendChild(langToggle);
    }

    // Toggle menu
    const toggleBtn = document.getElementById('lang-toggle-btn');
    const menu = document.getElementById('lang-menu');
    
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      menu.classList.add('hidden');
    });

    // Language selection
    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        localStorage.setItem(CONFIG.languageKey, lang);
        
        // Update URL with language parameter
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
      });
    });

    // Apply language if set
    applyLanguage(currentLang);
  }

  /**
   * Apply language to the page
   */
  function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    
    // Update any language-specific content
    // This is a simple implementation - in a real site, you'd need more complex i18n
    const langElements = document.querySelectorAll('[data-lang-en], [data-lang-fr]');
    langElements.forEach(el => {
      const content = el.getAttribute(`data-lang-${lang}`);
      if (content) {
        el.textContent = content;
      }
    });
  }

  /**
   * Initialize Reading Progress Indicator
   */
  function initReadingProgress() {
    // Only add to blog posts and articles
    const article = document.querySelector('article.page');
    if (!article) return;

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
    document.body.insertBefore(progressBar, document.body.firstChild);

    const bar = progressBar.querySelector('.reading-progress-bar');

    // Update progress on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateReadingProgress(bar, article);
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial update
    updateReadingProgress(bar, article);
  }

  /**
   * Update reading progress bar
   */
  function updateReadingProgress(bar, article) {
    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    const articleStart = articleTop - windowHeight / 4;
    const articleEnd = articleTop + articleHeight - windowHeight;
    const scrollProgress = (scrollTop - articleStart) / (articleEnd - articleStart);

    const progress = Math.max(0, Math.min(100, scrollProgress * 100));
    bar.style.width = `${progress}%`;
  }

  /**
   * Enhance Search Functionality
   */
  function enhanceSearch() {
    const searchInput = document.querySelector('.search-content input[type="text"]');
    if (!searchInput) return;

    // Add search enhancements
    const searchContainer = searchInput.parentElement;
    
    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear';
    clearBtn.innerHTML = '×';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.style.display = 'none';
    searchContainer.appendChild(clearBtn);

    searchInput.addEventListener('input', () => {
      clearBtn.style.display = searchInput.value ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      searchInput.focus();
      // Trigger input event to update search results
      searchInput.dispatchEvent(new Event('input'));
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchToggle = document.querySelector('.search__toggle');
        if (searchToggle) {
          searchToggle.click();
        }
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    // Enhance search results with highlighting
    enhanceSearchResults();
  }

  /**
   * Enhance search results display
   */
  function enhanceSearchResults() {
    // This would need to hook into the existing search implementation
    // For now, we'll add a MutationObserver to enhance results as they appear
    const resultsContainer = document.querySelector('.search-content .results__found');
    if (!resultsContainer) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches('.archive__item')) {
            // Add fade-in animation
            node.style.opacity = '0';
            setTimeout(() => {
              node.style.transition = 'opacity 0.3s ease-in';
              node.style.opacity = '1';
            }, 10);
          }
        });
      });
    });

    observer.observe(document.querySelector('.search-content'), {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance Social Sharing
   */
  function enhanceSocialSharing() {
    const shareSection = document.querySelector('.page__share');
    if (!shareSection) return;

    // Add additional sharing options
    const shareButtons = `
      <a href="#" class="btn btn--reddit" data-share="reddit" title="Share on Reddit">
        <i class="fab fa-fw fa-reddit" aria-hidden="true"></i><span> Reddit</span>
      </a>
      <a href="#" class="btn btn--whatsapp" data-share="whatsapp" title="Share on WhatsApp">
        <i class="fab fa-fw fa-whatsapp" aria-hidden="true"></i><span> WhatsApp</span>
      </a>
      <button class="btn btn--info" id="copy-link-btn" title="Copy link">
        <i class="fas fa-fw fa-link" aria-hidden="true"></i><span> Copy Link</span>
      </button>
    `;

    shareSection.insertAdjacentHTML('beforeend', shareButtons);

    // Handle Reddit sharing
    const redditBtn = shareSection.querySelector('[data-share="reddit"]');
    if (redditBtn) {
      redditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        window.open(`https://reddit.com/submit?url=${url}&title=${title}`, 'reddit-share', 'width=600,height=500');
      });
    }

    // Handle WhatsApp sharing
    const whatsappBtn = shareSection.querySelector('[data-share="whatsapp"]');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        window.open(`https://wa.me/?text=${text}%20${url}`, 'whatsapp-share');
      });
    }

    // Handle copy link
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-fw fa-check" aria-hidden="true"></i><span> Copied!</span>';
            setTimeout(() => {
              copyBtn.innerHTML = originalText;
            }, 2000);
          })
          .catch((err) => {
            console.error('Failed to copy:', err);
          });
      });
    }

    // Add Open Graph and Twitter Card meta tags dynamically if missing
    addSocialMetaTags();
  }

  /**
   * Add social sharing meta tags
   */
  function addSocialMetaTags() {
    const metaTags = [
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: document.title },
      { property: 'og:description', content: document.querySelector('meta[name="description"]')?.content || '' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: document.title },
      { name: 'twitter:description', content: document.querySelector('meta[name="description"]')?.content || '' }
    ];

    metaTags.forEach(tag => {
      const key = tag.property ? 'property' : 'name';
      const value = tag.property || tag.name;
      
      if (!document.querySelector(`meta[${key}="${value}"]`)) {
        const meta = document.createElement('meta');
        meta.setAttribute(key, value);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  /**
   * Add Modern UI Effects
   */
  function addModernUIEffects() {
    // Add loading states
    addLoadingStates();
    
    // Enhance animations
    enhanceAnimations();
    
    // Add intersection observer for fade-in effects
    addScrollAnimations();
  }

  /**
   * Add loading states to page
   */
  function addLoadingStates() {
    // Add page transition effect
    document.body.classList.add('page-loaded');

    // Add loading class to images
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.classList.add('loading');
        img.addEventListener('load', () => {
          img.classList.remove('loading');
          img.classList.add('loaded');
        });
      }
    });
  }

  /**
   * Enhance animations
   */
  function enhanceAnimations() {
    // Add hover effects to cards and links
    document.querySelectorAll('.archive__item, .list__item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * Add scroll-triggered animations
   */
  function addScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements that should animate in
    document.querySelectorAll('.archive__item, .page__content > *').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

})();
