const CACHE_NAME = 'musica-pwa-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Instalação: Salva o esqueleto do app
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Interceptação de Busca
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Retorna do cache se existir
      if (cachedResponse) return cachedResponse;

      // Se não estiver no cache, busca na rede
      return fetch(e.request).then((networkResponse) => {
        // Se for uma imagem da API (capa), salva no cache dinâmico
        if (e.request.url.includes('mzstatic.com')) {
          return caches.open('capas-dinamicas').then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Caso esteja offline e o recurso não esteja no cache
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
