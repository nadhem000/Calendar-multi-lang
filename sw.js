// Service Worker for Offline Functionality
const CACHE_NAME = 'calendar-cache-v2'; // Must match config.js
const isLocalEnvironment = (() => {
    try {
        return self.location.protocol === 'file:';
		} catch (e) {
        return false;
	}
})();
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
	'./assets/screenshots/screenshot_02.png',
	'./handle-file',
	'./note-with-attachment'
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
    
    event.respondWith(
        caches.match(event.request)
		.then(response => response || fetch(event.request))
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
