// Forma Plena · guarda la pasarela de la app en el móvil para que abra rápido y también sin conexión.
// Solo se ocupa de la puerta de la app (index, icono y manifest). La web pública (web/) no pasa por aquí.
// También recibe los avisos en el móvil (🔔): al llegar uno, pide el texto al servidor y lo muestra.
var CACHE = 'fp-puerta-v2';
// Servidor de la app (para pedir el texto de cada aviso)
var SERVIDOR = 'https://script.google.com/macros/s/AKfycbxoK5CtWp-VxVcLKB381XKj5cmmEpdNoK5os1zFFQd_FFPTUeZmptooGCfGiAjuO016xg/exec';
var BASICOS = ['./', './index.html', './manifest.webmanifest', './icons/favicon-32.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return /^fp-puerta-/.test(k) && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function conTiempo(p, ms) {
  return new Promise(function (ok, ko) {
    var t = setTimeout(function () { ko(new Error('lento')); }, ms);
    p.then(function (r) { clearTimeout(t); ok(r); }, function (e) { clearTimeout(t); ko(e); });
  });
}

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  var base = new URL('./', self.location).pathname;
  if (u.pathname.indexOf(base + 'web/') === 0) return;
  if (e.request.mode === 'navigate') {
    // Con red: la versión nueva (y se guarda). Sin red o muy lenta: la guardada.
    var red = fetch(e.request).then(function (r) {
      if (r && r.ok) { var c = r.clone(); caches.open(CACHE).then(function (x) { x.put('./index.html', c); }); }
      return r;
    });
    e.respondWith(conTiempo(red, 3000).catch(function () {
      return caches.match('./index.html').then(function (r) { return r || red; });
    }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request); }));
});

// ---------- 🔔 Avisos en el móvil ----------
function avisosPendientes() {
  return caches.open('fp-ajustes').then(function (c) { return Promise.all([c.match('token'), c.match('servidor')]); })
    .then(function (r) { return r[0] ? Promise.all([r[0].text(), r[1] ? r[1].text() : SERVIDOR]) : null; })
    .then(function (v) {
      if (!v || !v[0]) return [];
      return fetch(v[1] || SERVIDOR, { method: 'POST', credentials: 'omit', redirect: 'follow', body: JSON.stringify({ fn: 'pushPendientes', args: [v[0]] }) })
        .then(function (r) { return r.json(); }).then(function (j) { return j && j.ok && j.r ? j.r : []; });
    }).catch(function () { return []; });
}
self.addEventListener('push', function (e) {
  e.waitUntil(avisosPendientes().then(function (lista) {
    if (!lista.length) lista = [{ id: 'fp', titulo: 'Forma Plena', texto: 'Tienes un aviso nuevo en tu app.' }];
    return Promise.all(lista.slice(-3).map(function (a) {
      return self.registration.showNotification(a.titulo || 'Forma Plena', {
        body: a.texto || '', icon: 'icons/icono-192.png', badge: 'icons/favicon-32.png', tag: a.id || 'fp', data: { url: './' }
      });
    }));
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (ws) {
    for (var i = 0; i < ws.length; i++) if ('focus' in ws[i]) return ws[i].focus();
    return self.clients.openWindow('./');
  }));
});
