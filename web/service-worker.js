/* Wyre PWA service worker.
 *
 * Template: scripts/build-service-worker.js fills in the precache list and
 * version and writes dist/sw.js after `expo export -p web`. Do not register
 * this file directly; it is only registered in production web builds.
 *
 * Strategy
 * - Precache: the hashed JS/CSS bundles, fonts, images, icons, manifest and
 *   the offline page, so launches are fast and the shell works on bad networks.
 * - Pages (navigations): network first; if the network is unreachable, show
 *   /offline.html ("You're offline") instead of a blank screen.
 * - API (backend.wyreng.com and any other origin): never intercepted or cached.
 *   Requests always go to the network, so stale auth or data is never served.
 * - Updates: a new version installs in the background and takes over on the
 *   next launch. The app can also show a "Refresh" prompt, which posts
 *   SKIP_WAITING to activate it immediately.
 */
const CACHE_VERSION = '__CACHE_VERSION__';
const PRECACHE = `wyre-precache-${CACHE_VERSION}`;
const RUNTIME = `wyre-runtime-${CACHE_VERSION}`;
const PRECACHE_URLS = __PRECACHE_URLS__;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))),
      ),
  );
  // No skipWaiting() here: an update activates on the next launch (or when the
  // user taps "Refresh"), never in the middle of a session.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('wyre-') && key !== PRECACHE && key !== RUNTIME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_expo/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API calls and every other origin go straight to the network, uncached.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((offline) => offline || Response.error()),
      ),
    );
    return;
  }

  if (!isStaticAsset(url) && !PRECACHE_URLS.includes(url.pathname)) return;

  // Hashed static files never change, so cache first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && isStaticAsset(url)) {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
