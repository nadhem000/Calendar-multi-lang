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
    './scripts/main.js',
    './scripts/app-manager.js',
	'./assets/icons/ios/icon-192.png',
	'./assets/icons/android/icon-192.png',
	'./assets/icons/android/icon-512.png',
	'./assets/backgrounds/background.jpg',
	'./assets/screenshots/screenshot_01.png',
	'./assets/screenshots/screenshot_02.png'
  ];

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