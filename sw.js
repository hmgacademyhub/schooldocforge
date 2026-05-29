/* ═══════════════════════════════════════════════════════════════
   SchoolDocForge v7.2 — Service Worker
   Strategy: cache-first for app shell, network-first for HTML.
   Bump CACHE version to push updates to all users.
═══════════════════════════════════════════════════════════════ */
const CACHE = 'sdf-v7-2-0-hmg-enterprise';
const SHELL = [
  './',
  './index.html',
  './features.html',
  './feature-catalog.html',
  './modules.html',
  './enterprise.html',
  './guide.html',
  './brand.html',
  './about.html',
  './contact.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './css/style.css',
  './js/app.js',
  './js/generators.js',
  './js/enterprise.js',
  './js/enterprise_plus.js',
  // Free CDN libs (cached on first visit)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Network-first for HTML (so updates show after refresh)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for everything else (assets, libs, fonts)
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      if (resp && resp.status === 200 && (url.origin === location.origin || url.origin.includes('cdnjs') || url.origin.includes('gstatic') || url.origin.includes('googleapis'))) {
        const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return resp;
    }).catch(() => new Response('Offline', {status: 503, statusText: 'Offline'})))
  );
});
