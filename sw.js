// Diário do Bebê: funciona offline e recebe as notificações
const CACHE = 'diario-v8';
const SHELL = ['./', './index.html', './vendor/supabase.js', './manifest.webmanifest', './icons/icon-192.png', './icons/favicon.svg',
  './css/app.css', './css/base.css', './css/recursos.css', './js/01-base.js', './js/02-dados.js', './js/03-eventos.js', './js/04-telas-a.js', './js/05-telas-b.js', './js/06-modal-acoes.js', './js/07-dom.js', './js/08-app.js', './js/09-sons-tema.js', './js/10-album.js', './js/11-fraldas.js', './js/12-enxoval.js', './js/13-estoque.js', './js/14-boot.js', './js/15-resumo.js'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Diário do Bebê', {
    body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', tag: d.tag, data: { url: d.url || './' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ws) => {
    for (const w of ws) { if ('focus' in w) { if ('navigate' in w) w.navigate(url).catch(() => {}); return w.focus(); } }
    return clients.openWindow(url);
  }));
});
