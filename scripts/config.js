// scripts/config.js
const CACHE_CONFIG = {
	name: 'calendar-cache-v9',
	assets: [
		'./',
		'./manifest.json',
		'./index.html',
		'./offline.html',
		'./styles/main.css',
		'./styles/languages.css',
		'./styles/research.css',
		'./styles/notifications.css',
		'./styles/memories.css',
		'./styles/synchronizations.css',
		'./styles/languages_settings.css',
		'./styles/notes_specials.css',
		'./styles/settings.css',
		'./styles/footer.css',
		'./styles/widget.css',
		'./styles/export_import.css',
		'./scripts/languages.js',
		'./scripts/converter.js',
		'./scripts/calendar.js',
		'./scripts/notes_utils.js',
		'./scripts/addons.js',
		'./scripts/main.js',
		'./scripts/notifications.js',
		'./scripts/research.js',
		'./scripts/memories.js',
		'./scripts/synchronizations.js',
		'./scripts/languages_settings.js',
		'./scripts/notes.js',
		'./scripts/notes_specials_logic.js',
		'./scripts/notes_specials.js',
		'./scripts/app-manager.js',
		'./scripts/settings.js',
		'./scripts/footer.js',
		'./scripts/export_import.js',
		'./api/widget-data',
		'./assets/icons/ios/icon-192.png',
		'./assets/icons/android/icon-192.png',
		'./assets/icons/android/icon-512.png',
		'./assets/icons/health.png',
		'./assets/icons/note.png',
		'./assets/backgrounds/background.jpg',
		'./assets/screenshots/screenshot_01.png',
		'./assets/screenshots/screenshot_02.png',
		'./assets/sounds/background.mp3',
		'./assets/sounds/Violin_and_Piano_Harmony.mp3',
		'./assets/sounds/Ocean_Breeze.mp3'
	],
	strategies: {
		// Network-first strategy for dynamic content
		networkFirst: ['/api/notes', '/api/widget-data'],
		// Cache-first strategy for static assets  
		cacheFirst: ['/styles/', '/scripts/', '/assets/']
	}
};


/* // Export the config if using modules
	if (typeof module !== 'undefined' && module.exports) {
	module.exports = { CACHE_CONFIG };
	} else {
	window.CACHE_CONFIG = CACHE_CONFIG;
} */
