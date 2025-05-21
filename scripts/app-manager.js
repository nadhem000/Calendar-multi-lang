class AppManager {
	constructor() {
		this.CACHE_NAME = CACHE_CONFIG.name;
		this.ASSETS_TO_CACHE = CACHE_CONFIG.assets;
		this.BACKGROUND_SYNC_TAG = 'background-sync';
		this.PERIODIC_SYNC_TAG = 'periodic-sync';
		this.dbName = 'CalendarAttachments';
		this.dbVersion = 2; // Consistent version
		
	}
	async init() {
		await this.registerServiceWorker();
		this.setupInstallPrompt();
		this.setupStorageManagement();
		this.setupBackgroundSync();
		this.registerPeriodicSync();
		this.setupPushNotifications();
	}
	async performSafeCleanup() {
    try {
      // 1. Cache cleanup
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && 
              !name.includes('notes') &&
              !name.includes('prefs') &&
              name !== 'large-assets-v1') {
            return caches.delete(name);
          }
        })
      );

      // 2. IndexedDB cleanup (attachments >30 days old)
      const db = await this.openDB();
      const tx = db.transaction('attachments', 'readwrite');
      const store = tx.objectStore('attachments');
      const index = store.index('timestamp');
      
      let cursor = await index.openCursor(IDBKeyRange.upperBound(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ));
      
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      
      console.log('Cleanup completed safely');
    } catch (error) {
      console.log('Cleanup failed (non-critical):', error);
    }
  }
	monitorConnection() {
		const updateOnlineStatus = () => {
			const statusElement = document.getElementById('online-status');
			if (statusElement) {
				if (navigator.onLine) {
					statusElement.className = 'online';
					statusElement.title = 'Online';
					// When coming online, sync any localStorage fallbacks
					FileManager.syncAllFallbacks().catch(console.error);
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
	async registerServiceWorker() {
		const isLocalEnvironment = window.location.protocol === 'file:' || 
		window.location.hostname === 'localhost' || 
		window.location.hostname === '127.0.0.1';
		
		if (isLocalEnvironment) {
			console.log('Local environment detected - skipping Service Worker');
			return;
		}
		
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('./sw.js');
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							this.showUpdateNotification();
						}
					});
				});
				if (registration.waiting) {
					this.showUpdateNotification();
				}
				if (registration.active) {
					registration.active.postMessage({ 
						type: 'INIT', 
						cacheName: this.CACHE_NAME,
						currentLanguage: window.currentLanguage
					});
				}
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					window.location.reload();
				});
				} catch (error) {
				console.error('ServiceWorker registration failed:', error);
			}
		}
	}
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
	async cleanupOldData() {
		// Clear old caches
		const cacheNames = await caches.keys();
		await Promise.all(
			cacheNames.map(cacheName => {
				if (cacheName !== this.CACHE_NAME) {
					return caches.delete(cacheName);
				}
			})
		);
		// Clear old IndexedDB data
		try {
			const db = await this.openDB();
			const tx = db.transaction(['attachments', 'SYNC_QUEUE'], 'readwrite');
			await Promise.all([
				tx.objectStore('attachments').clear(),
				tx.objectStore('SYNC_QUEUE').clear()
			]);
			} catch (error) {
			console.error('Error clearing IndexedDB:', error);
		}
	}
	openDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);
			
			request.onerror = () => reject('IndexedDB open failed');
			
			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				if (!db.objectStoreNames.contains('attachments')) {
					db.createObjectStore('attachments', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('SYNC_QUEUE')) {
					db.createObjectStore('SYNC_QUEUE', { autoIncrement: true });
				}
			};
			
			request.onsuccess = (e) => resolve(e.target.result);
		});
	}
	setupInstallPrompt() {
		let deferredPrompt;
		
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			
			// Show your custom install button
			const installBtn = document.getElementById('install-btn');
			if (installBtn) {
				installBtn.style.display = 'block';
				installBtn.textContent = translations[currentLanguage].Install || 'Install App';
				
				// Remove any existing listeners to avoid duplicates
				installBtn.replaceWith(installBtn.cloneNode(true));
				document.getElementById('install-btn').addEventListener('click', async () => {
					if (deferredPrompt) {
						try {
							deferredPrompt.prompt();
							const { outcome } = await deferredPrompt.userChoice;
							console.log('User response:', outcome);
							if (outcome === 'accepted') {
								this.hideInstallButton();
							}
							} catch (err) {
							console.error('Install prompt error:', err);
						}
						deferredPrompt = null;
					}
				});
			}
		});
		
		window.addEventListener('appinstalled', () => {
			console.log('App installed successfully');
			this.hideInstallButton();
		});
	}
	hideInstallButton() {
		const installBtn = document.getElementById('install-btn');
		if (installBtn) installBtn.style.display = 'none';
	}
	setupStorageManagement() {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			navigator.storage.estimate().then(estimate => {
				console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes`);
				this.updateStorageUI(estimate.usage / estimate.quota);
			});
		}
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
			await this.clearOldCaches();
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
	// limit sync frequency
	async setupBackgroundSync() {
		if ('SyncManager' in window) {
			try {
				const registration = await navigator.serviceWorker.ready;
				// Check last sync time
				const lastSync = localStorage.getItem('lastSync');
				if (!lastSync || Date.now() - parseInt(lastSync) > 6 * 60 * 60 * 1000) {
					await registration.sync.register(this.BACKGROUND_SYNC_TAG);
					localStorage.setItem('lastSync', Date.now().toString());
				}
				} catch (error) {
				console.log('Background Sync not supported:', error);
			}
		}
	}
	async registerPeriodicSync() {
		if ('PeriodicSyncManager' in window) {
			try {
				const status = await navigator.permissions.query({name: 'periodic-background-sync'});
				if (status.state === 'granted') {
					const registration = await navigator.serviceWorker.ready;
					await registration.periodicSync.register(this.PERIODIC_SYNC_TAG, {
						minInterval: 24 * 60 * 60 * 1000
					});
				}
				} catch (error) {
				console.log('Periodic Sync not supported:', error);
			}
		}
	}
	async updateWidget() {
		if ('updateWidgets' in navigator) {
			try {
				const today = new Date().toISOString().split('T')[0];
				const notes = window.notes[today] || [];
				// Get random tip
				const categories = Object.keys(window.iconTips[currentLanguage]);
				const randomCategory = categories[Math.floor(Math.random() * categories.length)];
				const tips = window.iconTips[currentLanguage][randomCategory];
				const randomTip = tips[Math.floor(Math.random() * tips.length)];
				await navigator.updateWidgets({
					template: '/widget.html',
					data: {
						tip: randomTip,
						notes: notes
					}
				});
				} catch (error) {
				console.error('Widget update failed:', error);
			}
		}
	}
	async setupPushNotifications() {
		if ('Notification' in window && 'serviceWorker' in navigator) {
			try {
				const permission = await Notification.requestPermission();
				if (permission === 'granted') {
					console.log('Notification permission granted');
					this.scheduleDailyNotifications();
					this.setupNoteReminders();
				}
				} catch (error) {
				console.error('Error requesting notification permission:', error);
			}
		}
	}
	scheduleDailyNotifications() {
		if ('Notification' in window) {
			const now = new Date();
			const firstNotification = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				9, 0, 0
			);
			if (now > firstNotification) {
				firstNotification.setDate(firstNotification.getDate() + 1);
			}
			const timeout = firstNotification.getTime() - now.getTime();
			setTimeout(() => {
				this.showDailyTipNotification();
				setInterval(() => this.showDailyTipNotification(), 24 * 60 * 60 * 1000);
			}, timeout);
		}
	}
	showDailyTipNotification() {
		if ('Notification' in window && window.iconTips && window.iconTips[currentLanguage]) {
			const categories = Object.keys(window.iconTips[currentLanguage]);
			const randomCategory = categories[Math.floor(Math.random() * categories.length)];
			const tips = window.iconTips[currentLanguage][randomCategory];
			if (tips && tips.length > 0) {
				const randomTip = tips[Math.floor(Math.random() * tips.length)];
				const notification = new Notification(window.translations[currentLanguage].icons[randomCategory], {
					body: `${randomTip.name}: ${randomTip.description}`,
					icon: './assets/icons/android/icon-192.png',
					tag: 'daily-tip'
				});
				notification.onclick = () => {
					if (window.showTipsModal) {
						window.showTipsModal(randomCategory);
					}
				};
			}
		}
	}
	setupNoteReminders() {
		setInterval(() => {
			const today = new Date().toISOString().split('T')[0];
			if (window.notes && window.notes[today] && window.notes[today].length > 0) {
				const notification = new Notification(window.translations[currentLanguage].title, {
					body: window.translations[currentLanguage].notesReminder.replace('{count}', window.notes[today].length),
					icon: './assets/icons/android/icon-192.png',
					tag: 'notes-reminder'
				});
			}
		}, 24 * 60 * 60 * 1000);
	}
	showUpdateNotification() {
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(window.translations[currentLanguage].updateAvailable, {
				body: window.translations[currentLanguage].reloadPrompt,
				icon: './assets/icons/android/icon-192.png',
				tag: 'update-notification'
			});
			notification.onclick = () => {
				window.location.reload();
			};
			} else {
			const notification = document.createElement('div');
			notification.className = 'update-notification';
			notification.innerHTML = `
			<p>${window.translations[currentLanguage].updateAvailable || 'New version available!'}</p>
			<button id="reload-app">${window.translations[currentLanguage].reload || 'Reload'}</button>
			`;
			document.body.appendChild(notification);
			document.getElementById('reload-app').addEventListener('click', () => {
				window.location.reload();
			});
		}
	}
	sanitizeURL(url) {
		try {
			const parsed = new URL(url);
			// Allow both http/https and your custom protocol
			if (!['https:', 'http:', 'web+calmultilang:'].includes(parsed.protocol)) {
				return null;
			}
			if (!parsed.hostname.endsWith('netlify.app') && parsed.protocol.startsWith('http')) {
				return null;
			}
			return parsed.toString();
			} catch {
			return null;
		}
	}
	async checkStorageUsage() {
		if ('storage' in navigator && 'estimate' in navigator.storage) {
			const estimate = await navigator.storage.estimate();
			const usageRatio = estimate.usage / estimate.quota;
			if (usageRatio > 0.8) {
				await this.cleanupOldData();
			}
		}
	}
	static async processFile(file) {
		try {
			const result = await this.storeImage(file);
			return result;
			} catch (error) {
			console.error('File processing error:', error);
			throw error;
		}
	}
}
class FileManager {
	static async storeFile(file) {
		try {
			// First try IndexedDB
			const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const db = await this.#getDB();
			await db.transaction('attachments', 'readwrite')
			.objectStore('attachments')
			.add({ id, file, timestamp: Date.now() });
			
			return { id, source: 'indexeddb' };
			} catch (error) {
			console.warn('IndexedDB failed, falling back to localStorage');
			
			// Fallback to localStorage with size check
			if (file.size > 5 * 1024 * 1024) { // 5MB limit for localStorage
				throw new Error('File too large for fallback storage');
			}
			
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = async (e) => {
					const id = `local-${Date.now()}`;
					localStorage.setItem(id, e.target.result);
					
					// Store metadata about fallback files
					const fallbacks = JSON.parse(localStorage.getItem('fallbackFiles') || '[]');
					fallbacks.push({ id, name: file.name, type: file.type, size: file.size });
					localStorage.setItem('fallbackFiles', JSON.stringify(fallbacks));
					
					resolve({ id, source: 'localstorage' });
				};
				reader.readAsDataURL(file);
			});
		}
	}
	
	static async #getDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('CalendarFiles', 2);
			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				if (!db.objectStoreNames.contains('attachments')) {
					db.createObjectStore('attachments', { autoIncrement: true });
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}
	
	static async syncFallbacksToIndexedDB() {
		if (!navigator.onLine) return;
		
		const fallbacks = JSON.parse(localStorage.getItem('fallbackFiles') || '[]');
		for (const fileInfo of fallbacks) {
			try {
				const dataUrl = localStorage.getItem(fileInfo.id);
				if (dataUrl) {
					const response = await fetch(dataUrl);
					const blob = await response.blob();
					await this.storeFile(new File([blob], fileInfo.name, { type: fileInfo.type }));
					localStorage.removeItem(fileInfo.id);
				}
				} catch (error) {
				console.error(`Failed to sync file ${fileInfo.id}:`, error);
			}
		}
		
		// Update fallbacks list after sync
		const remaining = fallbacks.filter(f => localStorage.getItem(f.id));
		localStorage.setItem('fallbackFiles', JSON.stringify(remaining));
	}
}
document.addEventListener('DOMContentLoaded', () => {
	handleAppRouting();
	window.appManager = new AppManager();
	window.appManager.init().catch(error => {
		console.error('Initialization error:', error);
	});
});

if ('launchQueue' in window) {
	window.launchQueue.setConsumer((launchParams) => {
		if (launchParams.files.length > 0) {
			FileManager.processFile(launchParams.files[0]);
		}
	});
}
self.addEventListener('error', (event) => {
    console.error('SW Error:', event.error);
});
self.addEventListener('unhandledrejection', (event) => {
    console.error('SW Unhandled Rejection:', event.reason);
});
document.addEventListener('DOMContentLoaded', () => {
  // Run cleanup every 15 days when online
  const lastCleanup = localStorage.getItem('lastCleanup') || 0;
  if (Date.now() - lastCleanup > 15 * 24 * 60 * 60 * 1000 && navigator.onLine) {
    new AppManager().performSafeCleanup();
    localStorage.setItem('lastCleanup', Date.now());
  }
});