/**
	* App Manager - Handles caching, installation, and storage management
*/

class AppManager {
	constructor() {
		this.CACHE_NAME = 'calendar-cache-v2'; // Hardcode value
		this.ASSETS_TO_CACHE = [
			'./',
			'./index.html',
			'./manifest.json',
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
		]
        this.init();
		
	}
	async init() {
		this.registerServiceWorker();
		this.setupInstallPrompt();
		this.setupStorageManagement();
	}
	
	// Service Worker Registration
	async registerServiceWorker() {
		const isLocalEnvironment = window.location.protocol === 'file:';
		
		if (isLocalEnvironment) {
			console.log('Local environment detected - skipping Service Worker');
			return;
		}
		
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('./sw.js');
				
				// Add update handling
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							this.showUpdateNotification();
						}
					});
				});
				
				// Check for immediate updates
				if (registration.waiting) {
					this.showUpdateNotification();
				}
				
				// Initialize service worker communication
				if (registration.active) {
					registration.active.postMessage({ 
						type: 'INIT', 
						cacheName: this.CACHE_NAME 
					});
				}
				
				// Track updates from other tabs
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					window.location.reload();
				});
				
				} catch (error) {
				console.error('ServiceWorker registration failed:', error);
			}
		}
	}
	
	// Cache Management
	async cacheAssets() {
		if ('caches' in window) {
			try {
				const cache = await caches.open(this.CACHE_NAME);
				await cache.addAll(this.ASSETS_TO_CACHE);
				console.log('Assets cached successfully');
				} catch (error) {
				console.error('Failed to cache assets:', error);
			}
		}
	}
	
	async clearOldCaches() {
		const cacheNames = await caches.keys();
		await Promise.all(
			cacheNames.map(cacheName => {
				if (cacheName !== this.CACHE_NAME) {
					return caches.delete(cacheName);
				}
			})
		);
	}
	
	// PWA Installation
	setupInstallPrompt() {
		let deferredPrompt;
		
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			this.showInstallButton();
		});
		
		window.addEventListener('appinstalled', () => {
			console.log('App installed successfully');
			this.hideInstallButton();
		});
		
		document.getElementById('install-btn')?.addEventListener('click', async () => {
			if (deferredPrompt) {
				deferredPrompt.prompt();
				const { outcome } = await deferredPrompt.userChoice;
				if (outcome === 'accepted') {
					console.log('User accepted install');
				}
				deferredPrompt = null;
			}
		});
	}
	
	showInstallButton() {
		const installBtn = document.getElementById('install-btn');
		if (installBtn) {
			installBtn.style.display = 'block';
			installBtn.textContent = translations[currentLanguage].Install || 'Install App';
		}
	}
	
	hideInstallButton() {
		const installBtn = document.getElementById('install-btn');
		if (installBtn) installBtn.style.display = 'none';
	}
	
	// Storage Management
	setupStorageManagement() {
		// Monitor storage usage
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			navigator.storage.estimate().then(estimate => {
				console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes`);
				this.updateStorageUI(estimate.usage / estimate.quota);
			});
		}
		
		// Handle storage pressure
		if ('storage' in navigator && 'persist' in navigator.storage) {
			navigator.storage.persist().then(persisted => {
				if (persisted) {
					console.log('Storage will not be cleared without user permission');
				}
			});
		}
	}
	
	updateStorageUI(usageRatio) {
		const storageIndicator = document.getElementById('storage-indicator');
		if (storageIndicator) {
			const percentage = Math.round(usageRatio * 100);
			storageIndicator.style.width = `${percentage}%`;
			storageIndicator.title = `Using ${percentage}% of available storage`;
			
			if (percentage > 80) {
				storageIndicator.style.backgroundColor = '#f44336';
				this.showStorageWarning();
				} else if (percentage > 60) {
				storageIndicator.style.backgroundColor = '#ff9800';
				} else {
				storageIndicator.style.backgroundColor = '#4CAF50';
			}
		}
	}
	
	showStorageWarning() {
		const warning = document.createElement('div');
		warning.className = 'storage-warning';
		warning.innerHTML = `
		<p>${translations[currentLanguage].storageWarning || 'Your storage is almost full. Some features may not work properly.'}</p>
		<button id="clear-storage">${translations[currentLanguage].clearStorage || 'Clear old data'}</button>
		`;
		document.body.appendChild(warning);
		
		document.getElementById('clear-storage').addEventListener('click', () => {
			this.clearOldData();
			warning.remove();
		});
	}
	
	async clearOldData() {
		try {
			// Clear old caches
			await this.clearOldCaches();
			
			// Clear old notes (keep last 6 months)
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			
			for (const dateKey in window.notes) {
				const noteDate = new Date(dateKey);
				if (noteDate < sixMonthsAgo) {
					delete window.notes[dateKey];
				}
			}
			
			localStorage.setItem('calendarNotes', JSON.stringify(window.notes));
			alert(translations[currentLanguage].storageCleared || 'Old data cleared successfully');
			} catch (error) {
			console.error('Failed to clear old data:', error);
			alert(translations[currentLanguage].storageError || 'Error clearing old data');
		}
	}
	
	// Offline Status Monitoring
	monitorConnection() {
		const updateOnlineStatus = () => {
			const statusElement = document.getElementById('online-status');
			if (statusElement) {
				if (navigator.onLine) {
					statusElement.className = 'online';
					statusElement.title = 'Online';
					} else {
					statusElement.className = 'offline';
					statusElement.title = 'Offline - Working locally';
				}
			}
		};
		
		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);
		updateOnlineStatus();
	}
	
	// Update Notification
	showUpdateNotification() {
		const notification = document.createElement('div');
		notification.className = 'update-notification';
		notification.innerHTML = `
		<p>${translations[currentLanguage].updateAvailable || 'New version available!'}</p>
		<button id="reload-app">${translations[currentLanguage].reload || 'Reload'}</button>
		`;
		document.body.appendChild(notification);
		
		document.getElementById('reload-app').addEventListener('click', () => {
			window.location.reload();
		});
	}
}

// Initialize AppManager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.appManager = new AppManager();
});

// classe simplifiée
class FileManager {
	static async processFile(file) {
		const noteDate = new Date().toISOString().split('T')[0]; // Date actuelle
		
		if (file.type.startsWith('image/')) {
			const imageUrl = await this.storeImage(file);
			this.linkToNote(noteDate, {type: 'image', url: imageUrl});
			} else if (file.type === 'text/plain') {
			const text = await file.text();
			this.linkToNote(noteDate, {type: 'text', content: text});
		}
	}
	
	static async storeImage(file) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				localStorage.setItem(`img-${Date.now()}`, e.target.result);
				resolve(e.target.result);
			};
			reader.readAsDataURL(file);
		});
	}
	
	static linkToNote(date, attachment) {
		if (!window.notes[date]) window.notes[date] = [{}];
		
		const lastNoteIndex = window.notes[date].length - 1;
		if (!window.notes[date][lastNoteIndex].attachments) {
			window.notes[date][lastNoteIndex].attachments = [];
		}
		
		window.notes[date][lastNoteIndex].attachments.push(attachment);
		saveNotes(); // Assurez-vous que saveNotes() est accessible
	}
} // Fermeture de classe ajoutée

// Initialisation après la classe
if ('launchQueue' in window) {
	window.launchQueue.setConsumer((launchParams) => {
		if (launchParams.files.length > 0) {
			FileManager.processFile(launchParams.files[0]);
		}
	});
}