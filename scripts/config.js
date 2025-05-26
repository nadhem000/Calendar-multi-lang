
const CACHE_CONFIG = {
  name: 'calendar-cache-v4',
  assets: [
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
    './scripts/settings.js',
    './api/widget-data',
    './assets/icons/ios/icon-192.png',
    './assets/icons/android/icon-192.png',
    './assets/icons/android/icon-512.png',
    './assets/icons/health.png',
    './assets/icons/note.png',
    './assets/backgrounds/background.jpg',
    './assets/screenshots/screenshot_01.png',
    './assets/screenshots/screenshot_02.png'
  ],
  strategies: {
    networkFirst: ['/api/notes', '/api/widget-data'],
    cacheFirst: ['/styles/', '/scripts/', '/assets/']
  }
};

/* // Export the config if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CACHE_CONFIG };
} else {
  window.CACHE_CONFIG = CACHE_CONFIG;
} */