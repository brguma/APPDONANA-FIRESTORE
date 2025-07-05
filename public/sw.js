// 🔧 APP DONANA - Service Worker
// Versão: 2.0.0

const CACHE_NAME = 'donana-v2.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // Adicione outros recursos estáticos aqui
];

// 📦 Cache de recursos dinâmicos
const DYNAMIC_CACHE = 'donana-dynamic-v2.0.0';
const DATA_CACHE = 'donana-data-v2.0.0';

// 🔄 URLs que devem ser cacheadas dinamicamente
const dynamicCacheUrls = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com'
];

// 📊 URLs de dados que devem usar cache-first strategy
const dataCacheUrls = [
  'https://firestore.googleapis.com',
  'https://firebase.googleapis.com'
];

// 🚀 Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// 🔄 Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== DATA_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// 🌐 Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 🔥 Estratégia para Firebase/Firestore - Network First
  if (dataCacheUrls.some(cacheUrl => url.href.includes(cacheUrl))) {
    event.respondWith(
      networkFirstStrategy(request, DATA_CACHE)
    );
    return;
  }

  // 🎨 Estratégia para recursos dinâmicos - Stale While Revalidate
  if (dynamicCacheUrls.some(cacheUrl => url.href.includes(cacheUrl))) {
    event.respondWith(
      staleWhileRevalidateStrategy(request, DYNAMIC_CACHE)
    );
    return;
  }

  // 📱 Estratégia para app shell - Cache First
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      cacheFirstStrategy(request, CACHE_NAME)
    );
    return;
  }

  // 🖼️ Estratégia para imagens - Cache First com fallback
  if (request.destination === 'image') {
    event.respondWith(
      imageStrategy(request, DYNAMIC_CACHE)
    );
    return;
  }

  // 🌐 Estratégia padrão - Network First
  event.respondWith(
    networkFirstStrategy(request, DYNAMIC_CACHE)
  );
});

// 📊 Estratégias de Cache

// 🌐 Network First - Tenta rede primeiro, depois cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 Service Worker: Network failed, trying cache', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para offline
    return createOfflineResponse(request);
  }
}

// 📦 Cache First - Verifica cache primeiro, depois rede
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return createOfflineResponse(request);
  }
}

// 🔄 Stale While Revalidate - Retorna cache e atualiza em background
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null);
  
  return cachedResponse || networkPromise || createOfflineResponse(request);
}

// 🖼️ Estratégia para imagens
async function imageStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Retorna imagem placeholder para imagens offline
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#6b7280">🧁 Imagem Offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// 📱 Resposta para modo offline
function createOfflineResponse(request) {
  if (request.destination === 'document') {
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>APP DONANA - Offline</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #f472b6 0%, #a855f7 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .offline-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
          }
          .offline-icon { font-size: 4rem; margin-bottom: 20px; }
          .offline-title { font-size: 2rem; margin-bottom: 10px; }
          .offline-message { font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9; }
          .retry-button {
            background: white;
            color: #ec4899;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .retry-button:hover { transform: scale(1.05); }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">🧁</div>
          <h1 class="offline-title">APP DONANA</h1>
          <p class="offline-message">
            Você está offline, mas pode continuar usando o app com os dados salvos localmente.
          </p>
          <button class="retry-button" onclick="window.location.reload()">
            🔄 Tentar Novamente
          </button>
        </div>
        <script>
          // Recarrega automaticamente quando voltar online
          window.addEventListener('online', () => {
            window.location.reload();
          });
        </script>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  return new Response('Offline', { 
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// 📧 Background Sync para sincronização quando voltar online
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background Sync triggered', event.tag);
  
  if (event.tag === 'donana-sync') {
    event.waitUntil(syncData());
  }
});

// 🔄 Função de sincronização de dados
async function syncData() {
  try {
    console.log('🔄 Service Worker: Syncing data...');
    
    // Aqui você pode implementar a lógica de sincronização
    // com o Firebase quando voltar online
    
    // Exemplo: enviar dados pendentes para Firebase
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        payload: 'Data sync completed'
      });
    });
    
    console.log('✅ Service Worker: Data sync completed');
  } catch (error) {
    console.error('❌ Service Worker: Data sync failed', error);
  }
}

// 📱 Push notifications (futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'donana-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Detalhes'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 🎯 Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 📊 Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

console.log('🔧 Service Worker: Registered successfully - Version:', CACHE_NAME);