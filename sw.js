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
	if (url.pathname === '/handle-protocol') {
		event.respondWith(handleProtocolRequest(url));
		return;
	}
	
	// New handler function
	async function handleProtocolRequest(url) {
		const urlParams = new URLSearchParams(url.search);
		const externalUrl = urlParams.get('url');
		
		// Allowed origins (partner apps)
		const allowedOrigins = [
			'https://calendar-multi-lang.netlify.app',
			'https://his-geo-quiz-test.netlify.app',
			'https://noc-tunisia-chapter.netlify.app'
		];
		
		if (externalUrl && allowedOrigins.some(origin => externalUrl.startsWith(origin))) {
			// Valid URL - redirect securely
			return Response.redirect(externalUrl, 302);
			} else {
			// Block untrusted URLs
			return new Response('Invalid URL', { status: 403 });
		}
	}
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
	if (url.pathname === '/api/widget-data') {
		event.respondWith(handleWidgetData());
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
		clients.matchAll({type: 'window'}).then(windowClients => {
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
async function handleWidgetData() {
	const today = new Date().toISOString().split('T')[0];
	const cache = await caches.open(CACHE_NAME);
	const cached = await cache.match('/api/widget-data');
	
	if (cached) {
		return cached;
	}
	
	// Get fresh data
	const notes = window.notes[today] || [];
	const categories = Object.keys(window.iconTips[currentLanguage]);
	const randomCategory = categories[Math.floor(Math.random() * categories.length)];
	const tips = window.iconTips[currentLanguage][randomCategory];
	const randomTip = tips[Math.floor(Math.random() * tips.length)];
	
	const response = new Response(JSON.stringify({
		tip: randomTip,
		notes: notes
	}), {
    headers: {'Content-Type': 'application/json'}
	});
	
	await cache.put('/api/widget-data', response.clone());
	return response;
}