const CACHE_NAME = 'agroconsulta-cache-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/inicio.html',
  '/biblioteca.html',
  '/css/estilos.css',
  '/js/voice-search.js',
  '/img/icon.svg',
  '/img/portada.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar Service Worker y cachear recursos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar peticiones con estrategia Network First
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Comprueba si la respuesta es válida
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clona la respuesta y la guarda en caché para futuros usos offline
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      })
      .catch(() => {
        // Si falla la red (offline), intenta devolver desde caché
        return caches.match(event.request);
      })
  );
});

// Limpiar cachés antiguas al actualizar
self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
