// Ledgery service worker: lets the app open offline and install to the home screen.
// Pages are fetched fresh when online (so updates show up right away) and fall back to the cached copy offline.
const CACHE = 'ledgery-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './brand/icon-192.png', './brand/icon-512.png', './privacy.html', './terms.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Account and sync traffic always goes straight to the network.
  if (url.hostname.endsWith('supabase.co') || url.pathname.includes('/auth/')) return;
  const sameOrigin = url.origin === self.location.origin;
  const cacheable = sameOrigin || /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)$/.test(url.hostname);
  if (!cacheable) return;

  if (req.mode === 'navigate' || (sameOrigin && /\.(html|webmanifest)$|\/$/.test(url.pathname))) {
    // Network first: always the newest version when online.
    e.respondWith(fetch(req).then(res => {
      if (res.ok && !url.search) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Fonts, icons and the sync library: cached copy first, refreshed in the background.
  e.respondWith(caches.match(req).then(hit => {
    const fresh = fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || fresh;
  }));
});
