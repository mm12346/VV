// Basic service worker for PWA (can be expanded later)
const CACHE_NAME = 'admin-checker-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin-manifest.json',
  './index.tsx', // Pre-cache the main application script
  './icons/icon-192x192.png', // Pre-cache icons
  './icons/icon-512x512.png'
  // Add other critical assets here (e.g., JS bundles when not using CDN for React/ReactDOM)
  // For react/react-dom from esm.sh, caching them here might be beneficial if offline access is critical.
  // The fetch handler will attempt to cache them dynamically.
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
});

self.addEventListener('activate', event => {
  // Claim clients immediately so that the page controlled by this SW
  // can show an install button or other PWA UI elements.
  event.waitUntil(self.clients.claim());
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('admin-checker-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});


self.addEventListener('fetch', event => {
  // For navigation requests, try network first, then cache (Network-first strategy)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network is available, cache the response for future offline use
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request).then(response => {
            return response || caches.match('./index.html'); // Fallback to index.html for navigations
          });
        })
    );
    return;
  }

  // For other requests (assets, API calls if configured), use Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !networkResponse.type === 'cors') {
              if (event.request.url.includes('esm.sh')) { // Don't cache opaque responses from CDNs like esm.sh unless sure
                 // console.log('Skipping caching for CDN opaque response:', event.request.url);
              } else {
                // console.log('Fetch error or invalid response, not caching:', event.request.url, networkResponse);
              }
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            if (event.request.method === 'GET' && !event.request.url.includes('google.com/macros')) { // Don't cache GAS API calls by default
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
            }
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch failed for:', event.request.url, error);
            // Optionally, return a custom offline page or error response
            // For example, if it's an image, return a placeholder
            // if (event.request.destination === 'image') {
            //   return caches.match('/placeholder.png');
            // }
        });
      })
  );
});