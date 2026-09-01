// EC225 Flight Tools Landing - Service Worker
// Caches the landing page for offline use

const CACHE_NAME = 'ec225-landing-v17';
const FILES_TO_CACHE = [
  './',
  './index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Only clean up OUR OWN superseded caches ('ec225-landing-*').
  //
  // The landing page's "Download All Tools for Offline" button fills each
  // app's own cache (ec225-cat-a-v15, ec225-mission-fuel-v21, ...) so those
  // tools work without a connection. A blanket "delete every cache that
  // isn't mine" would throw all of that away the next time this service
  // worker updated -- and the pilot would only find out once offline.
  // Scope the sweep to this app's own prefix. (Fixed 2026-09-01.)
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
              return key !== CACHE_NAME && key.indexOf('ec225-landing-') === 0;
            })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
