// Forma Plena · guarda la pasarela de la app en el móvil para que abra rápido y también sin conexión.
// Solo se ocupa de la puerta de la app (index, icono y manifest). La web pública (web/) no pasa por aquí.
var CACHE = 'fp-puerta-v1';
var BASICOS = ['./', './index.html', './manifest.webmanifest', './icons/favicon-32.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
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
