/*
 * Service worker for Myyee.
 *
 * Deliberately network-first and cache-almost-nothing. This app shows what you
 * owe and what you've paid; serving a cached balance that is a day old would be
 * worse than showing nothing. The cache exists only so the app can say "you're
 * offline" instead of showing the browser's error page.
 */
const CACHE = 'myyee-shell-v1';
const OFFLINE_URL = '/myyee/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch anything but same-origin GETs: POSTs change money, and a
  // cached API response could show a settled bill as still outstanding.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  // Page navigations: always go to the network, fall back to the offline page.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Static assets only (icons, fonts, built JS/CSS): serve from cache when
  // present, otherwise fetch and store.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
