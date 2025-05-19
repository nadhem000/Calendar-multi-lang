// Service Worker for Offline Functionality
const CACHE_NAME = 'calendar-cache-v2';
const WIDGET_CACHE_NAME = 'widget-data-cache-v1';
const isLocalEnvironment = (() => {
    try {
        return self.location.protocol === 'file:';
    } catch (e) {
        return false;
    }
})();
const BACKGROUND_SYNC_TAG = 'sync-notes';
const PERIODIC_SYNC_TAG = 'periodic-update';
const SYNC_QUEUE = 'sync-queue';
const ASSETS_TO_CACHE = [
    './',
    './manifest.json',
    './index.html',
    './styles/main.css',
    './scripts/languages.js',
    './scripts/converter.js',
    './scripts/calendar.js',
    './scripts/notes.js',
    './scripts/addons.js',
    './scripts/main.js',
    './scripts/app-manager.js',
    './api/widget-data',
    './assets/icons/ios/icon-192.png',
    './assets/icons/android/icon-192.png',
    './assets/icons/android/icon-512.png',
    './assets/icons/health.png',
    './assets/icons/note.png',
    './assets/backgrounds/background.jpg',
    './assets/screenshots/screenshot_01.png',
    './assets/screenshots/screenshot_02.png'
];

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CalendarAttachments', 1);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('attachments')) {
                db.createObjectStore('attachments', { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
                db.createObjectStore(SYNC_QUEUE, { autoIncrement: true });
            }
        };
        
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

self.addEventListener('install', (event) => {
    if (isLocalEnvironment) {
        console.log('Local environment detected, skipping cache');
        return;
    }
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== WIDGET_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (isLocalEnvironment) return;
    
    const url = new URL(event.request.url);

    // Handle widget data with network-first strategy
    if (url.pathname === '/api/widget-data') {
        event.respondWith(
            (async () => {
                try {
                    // Try network first
                    const networkResponse = await fetch(event.request);
                    const cache = await caches.open(WIDGET_CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                } catch (error) {
                    // Fallback to cache
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Generate fallback data if no cache
                    return handleWidgetData();
                }
            })()
        );
        return;
    }

    // Handle share target
    if (url.pathname === '/share-target') {
        event.respondWith(handleShare(event.request));
        return;
    }

    // Handle app navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch {
                    const cachedResponse = await caches.match('/index.html');
                    return cachedResponse || new Response('Offline', { status: 200 });
                }
            })()
        );
        return;
    }

    // Handle protocol requests
    if (url.pathname === '/handle-protocol') {
        event.respondWith(handleProtocolRequest(url));
        return;
    }

    // Default cache-first strategy for other assets
    event.respondWith(
        (async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;
            
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            } catch {
                return new Response('Offline', { status: 200 });
            }
        })()
    );
});

async function handleShare(request) {
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    const db = await openDB();
    const tx = db.transaction('attachments', 'readwrite');
    await Promise.all(files.map(file => tx.store.add(file)));
    
    return Response.redirect('/note-with-attachment?shared=1', 303);
}

async function handleProtocolRequest(url) {
    const urlParams = new URLSearchParams(url.search);
    const externalUrl = urlParams.get('url');
    
    const allowedOrigins = [
        'https://calendar-multi-lang.netlify.app',
        'https://his-geo-quiz-test.netlify.app',
        'https://noc-tunisia-chapter.netlify.app'
    ];
    
    if (externalUrl && allowedOrigins.some(origin => externalUrl.startsWith(origin))) {
        return Response.redirect(externalUrl, 302);
    } else {
        return new Response('Invalid URL', { status: 403 });
    }
}

async function handleWidgetData() {
    const today = new Date().toISOString().split('T')[0];
    const notes = (await getNotesFromCache())?.[today] || [];
    const categories = Object.keys(window.iconTips?.[currentLanguage] || {});
    const randomCategory = categories[Math.floor(Math.random() * categories.length)] || '';
    const tips = window.iconTips?.[currentLanguage]?.[randomCategory] || [];
    const randomTip = tips[Math.floor(Math.random() * tips.length)] || {};

    const responseData = {
        tip: randomTip,
        notes: notes
    };

    const response = new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
    });

    // Cache the generated response
    const cache = await caches.open(WIDGET_CACHE_NAME);
    await cache.put('/api/widget-data', response.clone());
    
    return response;
}

async function getNotesFromCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match('/data/notes');
        return response ? await response.json() : null;
    } catch {
        return null;
    }
}

self.addEventListener('sync', (event) => {
    if (event.tag === BACKGROUND_SYNC_TAG) {
        event.waitUntil(processSyncQueue());
    }
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === PERIODIC_SYNC_TAG) {
        event.waitUntil(backgroundUpdate());
    }
});

async function processSyncQueue() {
    const db = await openDB();
    const tx = db.transaction(SYNC_QUEUE, 'readwrite');
    const queue = tx.objectStore(SYNC_QUEUE);
    
    let cursor = await queue.openCursor();
    while (cursor) {
        const { url, data } = cursor.value;
        try {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            await cursor.delete();
        } catch (error) {
            console.error('Sync failed:', error);
        }
        cursor = await cursor.continue();
    }
}

async function backgroundUpdate() {
    try {
        const updates = await fetch('/api/updates');
        const data = await updates.json();
        const cache = await caches.open(CACHE_NAME);
        await cache.put('/data/notes', new Response(JSON.stringify(data)));
    } catch (error) {
        console.error('Background update failed:', error);
    }
}

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './assets/icons/android/icon-192.png',
            badge: './assets/icons/android/icon-192.png',
            data: {
                url: data.url || '/'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            const url = event.notification.data.url || '/';
            for (let client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});