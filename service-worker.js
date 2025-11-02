self.addEventListener('install', e => {
  e.waitUntil(caches.open('vr-layout-v1').then(c => c.addAll(['./','./index.html','./style.css','./script.js','./data/vr_bus.json'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});