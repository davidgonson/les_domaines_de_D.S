/* Service worker — Les Domaines de DS (v2)
   - Reçoit les notifications push (même app fermée)
   - Pastille rouge sur l'icône de l'app (iOS/Android)
   - Un clic sur la notification ouvre l'app AU BON ENDROIT (sous-dossier GitHub Pages)
   À déposer À CÔTÉ de index.html sur GitHub Pages (remplace l'ancien sw.js). */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const jobs = [
    self.registration.showNotification(d.title || 'Les Domaines de DS', {
      body: d.body || '',
      tag: d.tag || 'ds-update',
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: { url: d.url || './' }
    })
  ];
  // Pastille rouge sur l'icône de l'app (si le téléphone le permet)
  try { if (self.navigator && self.navigator.setAppBadge) jobs.push(self.navigator.setAppBadge(1).catch(() => {})); } catch (_) {}
  e.waitUntil(Promise.all(jobs));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  try { if (self.navigator && self.navigator.clearAppBadge) self.navigator.clearAppBadge().catch(() => {}); } catch (_) {}
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      /* L'app vit dans un sous-dossier (davidgonson.github.io/xxx/), jamais à la racine :
         on résout l'adresse par rapport à l'emplacement du service worker. */
      const raw = (e.notification.data && e.notification.data.url) || './';
      const target = (raw === '/' ? self.registration.scope : new URL(raw, self.registration.scope).href);
      return clients.openWindow(target);
    })
  );
});
