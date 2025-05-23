// Service Worker for Offline Functionality
importScripts('./scripts/config.js');
let currentLanguage = 'en'; // Default fallback
const isLocalEnvironment = (() => {
    try {
        return self.location.protocol === 'file:';
		} catch (e) {
        return false;
	}
})();
let initialized = false;
const CACHE_NAME = CACHE_CONFIG.name;
const WIDGET_CACHE_NAME = 'widget-data-cache-v5';
const ASSETS_TO_CACHE = CACHE_CONFIG.assets;
const BACKGROUND_SYNC_TAG = 'sync-notes';
const PERIODIC_SYNC_TAG = 'periodic-update';
const SYNC_QUEUE = 'sync-queue';
const LARGE_ASSETS = [
  '/assets/backgrounds/background.jpg',
  '/assets/screenshots/screenshot_01.png',
  '/assets/screenshots/screenshot_02.png'
];
// Update the openDB function to match version:
const openDB = () => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('CalendarAttachments', 2); // Match version number
		
		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('attachments')) {
				db.createObjectStore('attachments', { keyPath: 'id' }); // Match keyPath
			}
			if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
				db.createObjectStore(SYNC_QUEUE, { autoIncrement: true });
			}
		};
		
		request.onsuccess = (e) => resolve(e.target.result);
		request.onerror = (e) => reject(e.target.error);
	});
};

self.addEventListener('message', (event) => {
    if (event.data.type === 'INIT' && !initialized) {
        initialized = true;
        currentLanguage = event.data.currentLanguage || 'en';
        console.log('Service Worker initialized with language:', currentLanguage);
    }
});
self.addEventListener('install', (event) => {
   if (isLocalEnvironment) {
        console.log('Local environment detected, skipping cache');
        return;
	}
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.keys().then(existingKeys => {
        // Preserve these data types during update
        const dataToKeep = existingKeys.filter(key => 
          key.url.includes('/api/notes') || 
          key.url.includes('/prefs') ||
          key.url.includes('/attachments')
        );
        
        // Add new assets + preserved data
        return Promise.all([
          cache.addAll(ASSETS_TO_CACHE),
          ...dataToKeep.map(item => cache.put(item.url, item))
        ]);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        // Delete old caches but keep data caches
        ...cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              !cacheName.includes('notes-') &&
              !cacheName.includes('prefs-') &&
              !cacheName.includes('attachments-')) {
            return caches.delete(cacheName);
          }
        }),
        
        // Claim clients immediately
        self.clients.claim()
      ]);
    })
  );
});
async function handleLargeAsset(request) {
  const cache = await caches.open('large-assets-v1');
  const cached = await cache.match(request);
  
  // 1. Return cached version if fresh (<30 days old)
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
    if (Date.now() - cachedAt < 30 * 24 * 60 * 60 * 1000) {
      return cached;
    }
  }

  // 2. Try network update
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      await cache.put(
        request,
        new Response(await networkResponse.blob(), { headers })
      );
    }
    return networkResponse;
  } catch {
    return cached || Response.error();
  }
}
self.addEventListener('fetch', (event) => {
  // Add this check FIRST in the fetch handler
  if (LARGE_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(handleLargeAsset(event.request));
    return;
  }
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
						const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
						if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
							return cachedResponse;
						}
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
	
    // Handle app navigation (network-first)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const networkResponse = await fetch(event.request);
                    // Update cache with fresh response
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
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
	
    // Cache-first strategy for static assets
    if (CACHE_CONFIG.strategies.cacheFirst.some(path => url.pathname.startsWith(path))) {
        event.respondWith(
            (async () => {
                // First try the cache
                
				const cachedResponse = await caches.match(event.request);
				if (cachedResponse) {
					const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
					if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
						return cachedResponse;
					}
				}
                
                // If not in cache, try network
                try {
                    const networkResponse = await fetch(event.request);
                    if (networkResponse.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(event.request, networkResponse.clone());
					}
                    return networkResponse;
					} catch {
                    return new Response('Offline', { status: 200 });
				}
			})()
		);
        return;
	}
	
    // Default network-first strategy for other API requests
    if (CACHE_CONFIG.strategies.networkFirst.some(path => url.pathname.startsWith(path))) {
        event.respondWith(
            (async () => {
                try {
                    // Try network first
                    const networkResponse = await fetch(event.request);
                    // Update cache
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
                    return networkResponse;
					} catch (error) {
                    // Fallback to cache
                    const cachedResponse = await caches.match(event.request);
                    return cachedResponse || new Response('Offline', { status: 200 });
				}
			})()
		);
        return;
	}
	
    // Fallback strategy for all other requests
    event.respondWith(
        (async () => {
            // Try cache first
            
			const cachedResponse = await caches.match(event.request);
			if (cachedResponse) {
				const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
				if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
					return cachedResponse;
				}
			}
            
            // Then try network
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
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
  let externalUrl = urlParams.get('url');
  
  // Decode URI if needed
  try {
    externalUrl = decodeURIComponent(externalUrl);
  } catch (e) {
    console.warn('Failed to decode URL:', externalUrl);
  }

  const allowedOrigins = [
    'https://calendar-multi-lang.netlify.app/',
    'https://his-geo-quiz-test.netlify.app/', 
    'https://noc-tunisian-chapter.netlify.app/',
    'web+calmultilang://'
  ];

  if (externalUrl && allowedOrigins.some(origin => {
    try {
      const urlObj = new URL(externalUrl);
      return urlObj.origin === origin || 
             externalUrl.startsWith(origin);
    } catch {
      return externalUrl.startsWith(origin);
    }
  })) {
    return Response.redirect(externalUrl, 302);
  }
  return new Response('Invalid URL', { status: 403 });
}


async function handleWidgetData() {
    const today = normalizeDateKey(new Date());
    const notes = (await getNotesFromCache())?.[today] || [];
    
    // Get icon tips from cache
    const iconTipsResponse = await caches.match('/data/iconTips');
    const iconTips = iconTipsResponse ? await iconTipsResponse.json() : {};
    
    const categories = Object.keys(iconTips[currentLanguage] || {});
    const randomCategory = categories[Math.floor(Math.random() * categories.length)] || '';
    const tips = iconTips[currentLanguage]?.[randomCategory] || [];
    const randomTip = tips[Math.floor(Math.random() * tips.length)] || {};
	
    const responseData = {
        tip: randomTip,
        notes: notes
	};
	
    const response = new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
	});
	
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
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = {
      title: "Calendar Update",
      body: "New notification",
      url: "/"
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Calendar",
      {
        body: data.body || "You have a new notification",
        icon: './assets/icons/android/icon-192.png',
        data: { url: data.url || '/' }
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({type: 'window'}).then((clientList) => {
            const url = event.notification.data?.url || '/';
            
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Only open new window if there are visible clients
            if (clients.openWindow && clientList.length > 0) {
                return clients.openWindow(url);
            }
            return Promise.resolve();
        })
    );
});


// add cache expiration
async function cacheWithExpiration(request, response, cacheName, maxAgeSeconds) {
	const cache = await caches.open(cacheName);
	const clonedResponse = response.clone();
	const headers = new Headers(clonedResponse.headers);
	headers.set('sw-cache-expires', (Date.now() + maxAgeSeconds * 1000).toString());
	await cache.put(request, new Response(clonedResponse.body, {
		status: clonedResponse.status,
		statusText: clonedResponse.statusText,
		headers: headers
	}));
}



