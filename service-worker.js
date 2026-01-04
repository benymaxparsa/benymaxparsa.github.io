/**
 * Service Worker for offline support and performance optimization
 * Version: 1.0.0
 */

const CACHE_NAME = 'parsa-portfolio-v1';
const RUNTIME_CACHE = 'parsa-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/assets/css/main.css',
  '/assets/js/main.min.js',
  '/assets/js/custom-enhancements.js',
  '/manifest.json',
  '/profile.png',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5/css/all.min.css'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[ServiceWorker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        console.log('[ServiceWorker] Deleting old cache:', cacheToDelete);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests - use more robust check
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== location.origin) {
    return;
  }

  // Network first for API calls and dynamic content
  if (event.request.url.includes('/api/') || event.request.url.includes('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first strategy for static assets (images, CSS, JS)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cache successful responses for future use
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch((error) => {
        console.error('[ServiceWorker] Fetch failed:', error);
        // Return a custom offline page if available
        return caches.match('/offline.html').catch(() => {
          return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
