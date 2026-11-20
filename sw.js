/* Çevrimdışı çalışma: uygulama dosyaları ilk açılışta, dış kütüphaneler (PDF.js, Excel vb.) kullanıldıkça önbelleğe alınır. */
var SURUM = 'bozer-v1';
var KABUK = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(SURUM).then(function(c){ return c.addAll(KABUK); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){ return n !== SURUM; }).map(function(n){ return caches.delete(n); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET') return;
  var ayni = new URL(r.url).origin === self.location.origin;
  if(ayni){
    /* uygulama dosyaları: önce ağdan (güncelleme gelsin), olmazsa önbellekten */
    e.respondWith(fetch(r).then(function(y){
      var k = y.clone(); caches.open(SURUM).then(function(c){ c.put(r, k); }); return y;
    }).catch(function(){ return caches.match(r).then(function(m){ return m || caches.match('index.html'); }); }));
  } else {
    /* dış kütüphaneler: önce önbellek */
    e.respondWith(caches.match(r).then(function(m){
      return m || fetch(r).then(function(y){
        if(y && (y.ok || y.type === 'opaque')){ var k = y.clone(); caches.open(SURUM).then(function(c){ c.put(r, k); }); }
        return y;
      });
    }));
  }
});
