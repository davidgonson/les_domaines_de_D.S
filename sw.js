/* Service worker — Les Domaines de DS
   Reçoit les notifications push (même app fermée) et ouvre l'app quand on appuie dessus.
   À déposer À CÔTÉ de index.html sur GitHub Pages (même dossier). */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Les Domaines de DS', {
    body: d.body || '',
    tag: d.tag || 'ds-update',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return clients.openWindow((e.notification.data && e.notification.data.url) || './');
    })
  );
});
