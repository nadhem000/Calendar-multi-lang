// Service Worker for Offline Functionality
const CACHE_NAME = 'calendar-cache-v2'; // Must match config.js
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
	'./assets/icons/ios/icon-192.png',
	'./assets/icons/android/icon-192.png',
	'./assets/icons/android/icon-512.png',
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
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', (event) => {
  if (isLocalEnvironment) return;

  const url = new URL(event.request.url);

  // Gestion prioritaire du partage
  if (url.pathname === '/share-target') {
    event.respondWith(handleShare(event.request));
    return;
  }

  // Gestion des liens d'application
  if (event.request.mode === 'navigate') {
    event.respondWith(handleAppNavigation(event.request));
    return;
  }

  // Stratégie de cache par défaut
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetchWithFallback(event.request))
  );
});
// Gestion des fichiers partagés
self.addEventListener('fetch', (event) => {
  if (isLocalEnvironment) return;

  const url = new URL(event.request.url);

  // Gestion du partage
  if (url.pathname === '/share-target') {
    event.respondWith(handleShare(event.request));
    return;
  }

  // Gestion des liens d'application
  if (event.request.mode === 'navigate' && 
      url.origin === 'https://calendar-multi-lang.netlify.app') {
    event.respondWith(
      caches.match('/index.html')
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Stratégie de cache par défaut
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

async function handleShare(request) {
	const formData = await request.formData();
	const files = formData.getAll('files');
	
	// Stocker dans IndexedDB
	const db = await openDB();
	const tx = db.transaction('attachments', 'readwrite');
	await Promise.all(files.map(file => tx.store.add(file)));
	
	return Response.redirect('/note-with-attachment?shared=1', 303);
}

// Modifiez l'événement fetch pour gérer les requêtes en échec

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
    const {url, data} = cursor.value;
    try {
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
      });
      await cursor.delete();
    } catch (error) {
      console.error('Sync failed:', error);
    }
    cursor = await cursor.continue();
  }
}

async function backgroundUpdate() {
  // Exemple : Mettre à jour les notes du serveur
  const updates = await fetch('/api/updates');
  const data = await updates.json();
  const cache = await caches.open(CACHE_NAME);
  await cache.put('/data/notes', new Response(JSON.stringify(data)));
}