// Forma Plena Coach · solo hace que el panel se pueda instalar como app. No guarda nada.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
