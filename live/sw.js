const CACHE_NAME = 'ufestival-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/i18n.js',
  './js/info.js',
  './js/lineup.js',
  './js/map.js',
  './data/i18n.json',
  './data/info.json',
  './data/lineup.json',
  './manifest.json',
  './assets/logo_black.svg',
  './assets/logo_white.svg',
  './assets/logob.png',
  './assets/logow.png',
  './assets/ponton.png',
  './assets/thelake.png',
  './assets/theclub.png',
  './assets/hangar.png',
  './assets/markers/kaart_festival_markers.svg'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
