const CACHE = 'womo-pro-1.1.73';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './fonts/rajdhani-400.woff2',
  './fonts/rajdhani-500.woff2',
  './fonts/rajdhani-600.woff2',
  './fonts/rajdhani-700.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
