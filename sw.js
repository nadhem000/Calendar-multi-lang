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
		const request = indexedDB.open('CalendarAttachments', 5); // Match version number
		
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
    switch (event.data.type) {
        case 'INIT':
            initialized = true;
            currentLanguage = event.data.language || 'en';
            break;
        case 'SET_LANGUAGE':
            currentLanguage = event.data.language || currentLanguage;
            break;
    }
    console.log('Service Worker language updated to:', currentLanguage);
});
self.addEventListener('install', (event) => {
  if (isLocalEnvironment) {
    console.log('Local environment detected, skipping cache');
    return self.skipWaiting(); // Important for local testing
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache ALL assets including manifest.json
      return cache.addAll(ASSETS_TO_CACHE)
        .then(() => {
          console.log('All assets cached successfully');
          return cache.keys(); // Get existing cached items
        })
        .then(existingKeys => {
          // Preserve API data that shouldn't be overwritten
          const dataToKeep = existingKeys.filter(key => 
            key.url.includes('/api/notes') || 
            key.url.includes('/prefs') ||
            key.url.includes('/attachments')
          );
          
          // Re-add preserved data
          return Promise.all(
            dataToKeep.map(item => cache.put(item.url, item))
          );
        });
    })
    .then(() => self.skipWaiting()) // Force activate new SW
    .catch(error => {
      console.error('Cache installation failed:', error);
      // Even if caching fails, skip waiting to activate SW
      return self.skipWaiting();
    })
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
  const url = new URL(event.request.url);
  
  // Unified manifest.json handling
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
        .catch(() => new Response('{}', {
          headers: {'Content-Type': 'application/json'}
        }))
    );
    return;
  }

  // Add language to cache key for API requests
  if (url.pathname.startsWith('/api/')) {
    const langAwareRequest = new Request(
      `${url.pathname}?lang=${currentLanguage}`,
      event.request
    );
    event.respondWith(handleApiFetch(langAwareRequest));
    return;
  }

  if (LARGE_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(handleLargeAsset(event.request));
    return;
  }

  if (isLocalEnvironment) return;

  // Special route handlers
  if (url.pathname === '/api/widget-data') {
    event.respondWith(handleWidgetRequest(event.request));
    return;
  }
  
  if (url.pathname === '/share-target') {
    event.respondWith(handleShare(event.request));
    return;
  }
  
  if (url.pathname === '/handle-protocol') {
    event.respondWith(handleProtocolRequest(url));
    return;
  }

  // Navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event.request)
    );
    return;
  }

  // Apply caching strategies
  if (CACHE_CONFIG.strategies.cacheFirst.some(path => url.pathname.startsWith(path))) {
    event.respondWith(handleCacheFirst(event.request));
    return;
  }

  if (CACHE_CONFIG.strategies.networkFirst.some(path => url.pathname.startsWith(path))) {
    event.respondWith(handleNetworkFirst(event.request));
    return;
  }

  // Fallback strategy
  event.respondWith(handleFallbackRequest(event.request));
});

// Helper functions for better organization
async function handleWidgetRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(WIDGET_CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
      if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
        return cachedResponse;
      }
    }
    return handleWidgetData();
  }
}

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    return caches.match('/index.html') || 
           new Response('<h1>Offline</h1><p>You are offline but this page is not cached.</p>', {
             headers: {'Content-Type': 'text/html'}
           });
  }
}

async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
    if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return cachedResponse || Response.error();
  }
}

async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

async function handleFallbackRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const expiresHeader = cachedResponse.headers.get('sw-cache-expires');
      if (!expiresHeader || Date.now() < parseInt(expiresHeader)) {
        return cachedResponse;
      }
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return caches.match('/offline.html') || 
           caches.match('/index.html') || 
           new Response('Offline', { status: 200 });
  }
}
async function safeFetch(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response;
        })
        .catch(error => {
            console.error('Fetch failed:', error);
            // Can't use showToast in SW - use postMessage instead
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({
                    type: 'NETWORK_ERROR',
                    message: 'Working offline'
                }));
            });
            throw error;
        });
}

async function handleApiFetch(request) {
    const cache = await caches.open(`${CACHE_NAME}-${currentLanguage}`);
    try {
        if (localStorage.getItem('syncStorage') === 'true') {
            const networkResponse = await fetch(request);
            await cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        throw new Error('Sync disabled by user');
    } catch {
        const cached = await cache.match(request);
        return cached || Response.error();
    }
}
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
    if (localStorage.getItem('syncStorage') !== 'true') return;
    
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
    if (localStorage.getItem('autoUpdate') !== 'true') return;
    
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




self.addEventListener('fetch', event => {
  if (event.request.url.includes('manifest.json')) {
    console.log('Manifest fetch initiated by:', new Error().stack);
  }
});