/**
 * Service Worker para LinguaForge PWA
 * Maneja cache de recursos y funcionamiento offline
 */

const CACHE_NAME = 'linguaforge-v1';
const RUNTIME_CACHE = 'linguaforge-runtime';

// Recursos para cache inicial (app shell)
const PRECACHE_URLS = [
  '/',
  '/learn',
  '/input',
  '/decks',
  '/profile',
  '/manifest.json',
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activar inmediatamente
  self.skipWaiting();
});

// Activar y limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Tomar control de todas las páginas
  self.clients.claim();
});

// Estrategia de cache: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests del mismo origen
  if (url.origin !== self.location.origin) {
    return;
  }

  // No cachear API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // No cachear requests de auth
  if (url.pathname.startsWith('/auth/')) {
    return;
  }

  event.respondWith(
    // Intentar network primero
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, guardar en cache
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla network, buscar en cache
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Si no está en cache, mostrar página offline para navegación
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync para sincronizar cuando vuelve la conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(
      // Notificar a la app que sincronice
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_PROGRESS' });
        });
      })
    );
  }
});
