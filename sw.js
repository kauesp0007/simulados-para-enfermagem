/**
 * Service Worker
 * Implementa funcionalidade offline e cache para PWA
 * Arquivo: sw.js
 */

const CACHE_NAME = 'enfermagem-concurseira-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Arquivos para cache estático (核心资源)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/variables.css',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/pages.css',
    '/assets/js/app-orchestrator.js',
    '/assets/js/event-bus.js',
    '/assets/js/header.js',
    '/assets/js/accessibility.js',
    '/assets/app/services/db.js',
    '/assets/app/services/auth.js',
    '/assets/app/services/api.js',
    '/assets/app/services/sm2.js',
    '/assets/app/components/Sidebar.js',
    '/assets/app/components/Modal.js',
    '/assets/app/components/Toast.js',
    '/assets/app/components/DataApp.js',
    '/assets/app/pages/BasePage.js',
    '/assets/app/pages/Dashboard.js',
    '/assets/app/pages/Quiz.js',
    '/assets/app/pages/AdminPanel.js',
    '/assets/app/pages/PublicContests.js',
    '/assets/app/pages/MyContests.js',
    '/assets/app/pages/MyQuestions.js',
    '/assets/app/pages/Pomodoro.js',
    '/assets/app/pages/Library.js',
    '/assets/app/pages/Settings.js',
    '/assets/app/pages/Performance.js',
    '/assets/app/data/metadata.json',
    '/assets/app/data/questions.json',
    '/assets/app/data/contests.json',
    '/assets/app/data/quizzes.json',
    '/assets/app/data/flashcards.json',
    '/assets/app/data/library.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Fazendo cache de assets estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Assets estáticos em cache');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Erro ao fazer cache:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Remover caches antigos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker ativo');
                return self.clients.claim();
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estratégia: Cache First, luego Network
    // Para recursos estáticos: Cache First
    if (isStaticResource(url)) {
        event.respondWith(cacheFirst(request));
    }
    // Para APIs e dados: Network First
    else if (isApiRequest(url)) {
        event.respondWith(networkFirst(request));
    }
    // Para páginas: Stale While Revalidate
    else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Verificar se é recurso estático
function isStaticResource(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext)) || 
           url.pathname.startsWith('/assets/');
}

// Verificar se é requisição de API
function isApiRequest(url) {
    return url.pathname.startsWith('/api/') || 
           url.hostname.includes('api.');
}

// Estratégia Cache First
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        console.log('[SW] Servindo do cache:', request.url);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Erro em Cache First:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Estratégia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Rede indisponível, buscando no cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar resposta de erro amigável
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'Você está offline. Os dados serão sincronizados quando a conexão for restaurada.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, networkResponse.clone()));
            }
            return networkResponse;
        })
        .catch((error) => {
            console.log('[SW] Erro em Stale While Revalidate:', error);
            return cachedResponse;
        });
    
    return cachedResponse || fetchPromise;
}

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
    console.log('[SW] Evento de sincronização:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Sincronizar dados pendentes
async function syncData() {
    console.log('[SW] Sincronizando dados...');
    
    try {
        // Obter dados pendentes do IndexedDB
        const pendingSync = await getPendingSyncData();
        
        for (const item of pendingSync) {
            try {
                await fetch(item.url, {
                    method: item.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.data)
                });
                
                // Remover do pending sync
                await removePendingSyncItem(item.id);
            } catch (error) {
                console.error('[SW] Erro ao sincronizar item:', error);
            }
        }
        
        console.log('[SW] Sincronização concluída');
    } catch (error) {
        console.error('[SW] Erro na sincronização:', error);
    }
}

// Notificações Push
self.addEventListener('push', (event) => {
    console.log('[SW] Notificação push recebida');
    
    let data = { title: 'Enfermagem Concurseira', body: 'Você tem novas questões para estudar!', icon: '/icon.png' };
    
    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || '/icon.png',
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey || 1
        },
        actions: [
            { action: 'study', title: 'Estudar Agora' },
            { action: 'close', title: 'Depois' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificação clicada:', event.action);
    
    event.notification.close();
    
    if (event.action === 'study') {
        event.waitUntil(
            clients.openWindow('/#/quiz')
        );
    } else if (event.action === 'close') {
        // Apenas fechar a notificação
    } else {
        // Clique na notificação (não nos botões de ação)
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Mensagens dos clientes
self.addEventListener('message', (event) => {
    console.log('[SW] Mensagem recebida:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Funções auxiliares para IndexedDB no SW
function getPendingSyncData() {
    return new Promise((resolve, reject) => {
        // Implementação simplificada - em produção usaria IndexedDB
        resolve([]);
    });
}

function removePendingSyncItem(id) {
    return Promise.resolve();
}

// Limpeza periódica de cache
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-cache') {
        event.waitUntil(cleanupCache());
    }
});

// Limpar cache antigo
async function cleanupCache() {
    console.log('[SW] Limpando cache antigo...');
    
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('static-') || name.startsWith('dynamic-')
    );
    
    await Promise.all(
        oldCaches.map(name => caches.delete(name))
    );
    
    console.log('[SW] Limpeza de cache concluída');
}
