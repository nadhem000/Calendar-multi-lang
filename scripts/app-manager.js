class AppManager {
	constructor() {
		this.CACHE_NAME = CACHE_CONFIG.name;
		this.ASSETS_TO_CACHE = CACHE_CONFIG.assets;
		this.BACKGROUND_SYNC_TAG = 'background-sync';
		this.PERIODIC_SYNC_TAG = 'periodic-sync';
		this.dbName = 'CalendarAttachments';
		this.dbVersion = 5;  // Consistent version
		
	}
	async init() {
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupStorageManagement();
    this.setupBackgroundSync();
    this.registerPeriodicSync();
    this.setupPushNotifications();
    this.checkNotificationSettings();
    this.setupNotificationSettings(); 
	}
	async performSafeCleanup() {
		const loading = showLoading();
		try {
			// 1. Clear notes older than 6 months
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			
			Object.keys(window.notes).forEach(dateKey => {
				const noteDate = new Date(dateKey);
				if (noteDate < sixMonthsAgo) {
					delete window.notes[dateKey];
				}
			});
			
			// 2. Clear old IndexedDB attachments (30+ days old)
			const db = await this.openDB();
			const tx = db.transaction('attachments', 'readwrite');
			const store = tx.objectStore('attachments');
			const index = store.index('timestamp');
			
			const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
			let cursor = await index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
			
			while (cursor) {
				await cursor.delete();
				cursor = await cursor.continue();
			}
			
			saveNotes();
			showToast(translations[currentLanguage].storageCleared);
			} catch (error) {
			console.error('Cleanup failed:', error);
			showToast(translations[currentLanguage].storageError);
			} finally {
			hideLoading(loading);
		}
	}
    async withRetry(operation, maxRetries = 3, delay = 100) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
				} catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		}
        throw lastError;
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
				
				// Version synchronization handling
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing;
					
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							const autoUpdate = localStorage.getItem('autoUpdate') === 'true';
							const lang = translations[currentLanguage].syncOptions;
							
							if (autoUpdate) {
								// Auto-update flow
								showToast(lang.updating);
								setTimeout(() => {
									window.location.reload();
								}, 1500);
								} else {
								// Notification-only flow
								const notification = document.createElement('div');
								notification.className = 'update-notification';
								notification.innerHTML = `
                                <p>${lang.newVersion}</p>
                                <button id="reload-now">${translations[currentLanguage].reload || 'Reload'}</button>
								`;
								document.body.appendChild(notification);
								
								document.getElementById('reload-now').addEventListener('click', () => {
									window.location.reload();
								});
							}
						}
					});
				});
				
				if (registration.waiting) {
					if (localStorage.getItem('autoUpdate') === 'true') {
						window.location.reload();
					}
				}
				
				if (registration.active) {
					registration.active.postMessage({ 
						type: 'INIT', 
						currentLanguage: window.currentLanguage || 'en'
					});
				}
				
				navigator.serviceWorker.addEventListener('controllerchange', () => {
					if (localStorage.getItem('autoUpdate') === 'true') {
						window.location.reload();
					}
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
	// In app-manager.js, update the cleanup methods:
	async cleanupOldData() {
		try {
			const db = await this.openDB();
			const tx = db.transaction(['attachments', 'SYNC_QUEUE'], 'readwrite');
			
			tx.onerror = (event) => {
				console.error('Transaction error:', event.target.error);
			};
			
			await Promise.all([
				new Promise((resolve, reject) => {
					const req = tx.objectStore('attachments').clear();
					req.onsuccess = resolve;
					req.onerror = reject;
				}),
				new Promise((resolve, reject) => {
					const req = tx.objectStore('SYNC_QUEUE').clear();
					req.onsuccess = resolve;
					req.onerror = reject;
				})
			]);
			} catch (error) {
			console.error('Error clearing IndexedDB:', error);
			throw error;
		}
	}
	async openDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);
			
			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				const oldVersion = e.oldVersion || 0;
				
				// Initial version
				if (oldVersion < 1) {
					const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
					attachmentsStore.createIndex('timestamp', 'timestamp', { unique: false });
				}
				
				// Version 2 adds SYNC_QUEUE
				if (oldVersion < 2) {
					db.createObjectStore('SYNC_QUEUE', { autoIncrement: true });
				}
				
				// Version 3 adds sync metadata
				if (oldVersion < 3) {
					if (!db.objectStoreNames.contains('sync_metadata')) {
						const metaStore = db.createObjectStore('sync_metadata', { keyPath: 'key' });
						metaStore.createIndex('lastSynced', 'lastSynced', { unique: false });
					}
				}
			};
			
			request.onsuccess = (e) => {
				const db = e.target.result;
				
				// Storage synchronization if enabled
				if (localStorage.getItem('syncStorage') === 'true') {
					this.syncStorageWithDB(db).catch(console.error);
				}
				
				db.onerror = (event) => {
					console.error('Database error:', event.target.error);
				};
				
				resolve(db);
			};
			
			request.onerror = (event) => {
				reject(`IndexedDB open failed: ${event.target.error}`);
			};
		});
	}
	
	async syncStorageWithDB(db) {
		if (localStorage.getItem('syncStorage') !== 'true') return;
		// Sync notes from localStorage to IndexedDB
		const notes = JSON.parse(localStorage.getItem('calendarNotes') || '{}');
		const tx = db.transaction(['attachments', 'sync_metadata'], 'readwrite');
		
		// Store notes in IndexedDB
		const metaStore = tx.objectStore('sync_metadata');
		await metaStore.put({ 
			key: 'last_storage_sync', 
			value: notes,
			lastSynced: Date.now() 
		});
		
		// Sync attachments from IndexedDB to localStorage (for fallback)
		const attachments = [];
		const attachmentsStore = tx.objectStore('attachments');
		const cursorRequest = attachmentsStore.openCursor();
		
		cursorRequest.onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) {
				attachments.push(cursor.value);
				cursor.continue();
				} else {
				// Store attachments metadata in localStorage
				localStorage.setItem('attachments_meta', JSON.stringify({
					count: attachments.length,
					lastUpdated: Date.now()
				}));
			}
		};
		
		await tx.complete;
	}
	setupInstallPrompt() {
		let deferredPrompt;
		
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			
			const installBtn = document.getElementById('install-btn');
			if (installBtn) {
				installBtn.style.display = 'block';
				installBtn.textContent = translations[currentLanguage].Install || 'Install App';
				
				// Clone to prevent duplicate listeners (GOOD PRACTICE)
				const newBtn = installBtn.cloneNode(true);
				installBtn.replaceWith(newBtn);
				
				newBtn.addEventListener('click', async () => {
					if (!deferredPrompt) return;
					
					try {
						deferredPrompt.prompt();
						const { outcome } = await deferredPrompt.userChoice;
						console.log('User response:', outcome);
						if (outcome === 'accepted') {
							this.hideInstallButton();
						}
						} catch (err) {
						console.error('Install prompt error:', err);
						showToast('Installation failed. Please try again later.');
						} finally {
						deferredPrompt = null;
					}
				});
			}
		});
		
		window.addEventListener('appinstalled', () => {
			console.log('App installed successfully');
			this.hideInstallButton();
			// Optional: Send analytics
			if (typeof gtag !== 'undefined') {
				gtag('event', 'installation', { method: 'pwa' });
			}
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
		if (localStorage.getItem('syncStorage') !== 'true') return;
		
		if ('SyncManager' in window) {
			try {
				const registration = await navigator.serviceWorker.ready;
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
		if (localStorage.getItem('autoUpdate') !== 'true') return;
		
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
	sanitizeURL(url) {
		try {
			const parsed = new URL(url);
			// Allow both http/https and custom protocol
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
			
			// Update storage indicator UI
			this.updateStorageUI(usageRatio);
			
			// New emergency handling
			if (usageRatio > 0.9) {
				const emergencyCleanEnabled = localStorage.getItem('emergencyCleanEnabled') === 'true';
				
				if (emergencyCleanEnabled) {
					showToast(translations[currentLanguage].storageClearing);
					await this.performSafeCleanup();
					} else {
					if (confirm(translations[currentLanguage].storageWarning90)) {
						await this.performSafeCleanup();
					}
				}
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
async checkNotificationSettings() {
    // Only proceed if notifications are enabled in settings
    if (localStorage.getItem('dailyTipsEnabled') === 'true') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.scheduleDailyNotifications();
        }
    }
    
    if (localStorage.getItem('noteRemindersEnabled') === 'true') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.setupNoteReminders();
        }
    }
}
	async setupNotificationSettings() {
		// Load saved preferences
		document.getElementById('daily-tips-toggle').checked = 
        localStorage.getItem('dailyTipsEnabled') === 'true';
		document.getElementById('note-reminders-toggle').checked = 
        localStorage.getItem('noteRemindersEnabled') === 'true';
		document.getElementById('updates-toggle').checked = 
        localStorage.getItem('appUpdatesEnabled') === 'true';
		
		// Add event listeners
		document.getElementById('daily-tips-toggle').addEventListener('change', (e) => {
			localStorage.setItem('dailyTipsEnabled', e.target.checked);
			if (e.target.checked) {
				this.scheduleDailyNotifications();
				} else {
				// Clear any scheduled notifications
				if ('Notification' in window) {
					Notification.requestPermission().then(() => {
						navigator.serviceWorker.getRegistration().then(reg => {
							if (reg) {
								reg.getNotifications({ tag: 'daily-tip' }).then(notifications => {
									notifications.forEach(n => n.close());
								});
							}
						});
					});
				}
			}
		});
		
		document.getElementById('note-reminders-toggle').addEventListener('change', (e) => {
			localStorage.setItem('noteRemindersEnabled', e.target.checked);
			if (e.target.checked) {
				this.setupNoteReminders();
				} else {
				// Clear any scheduled reminders
				if ('Notification' in window) {
					Notification.requestPermission().then(() => {
						navigator.serviceWorker.getRegistration().then(reg => {
							if (reg) {
								reg.getNotifications({ tag: 'notes-reminder' }).then(notifications => {
									notifications.forEach(n => n.close());
								});
							}
						});
					});
				}
			}
		});
		
		document.getElementById('updates-toggle').addEventListener('change', (e) => {
			localStorage.setItem('appUpdatesEnabled', e.target.checked);
		});
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
async scheduleDailyNotifications() {
    // Double check the setting and permission
    if (localStorage.getItem('dailyTipsEnabled') !== 'true') return;
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    
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
        // Set interval for daily notifications
        setInterval(() => this.showDailyTipNotification(), 24 * 60 * 60 * 1000);
    }, timeout);
}
async showDailyTipNotification() {
    if (localStorage.getItem('dailyTipsEnabled') !== 'true') return;
    if (!('Notification' in window) || !window.iconTips || !window.iconTips[currentLanguage]) return;
    
    const categories = Object.keys(window.iconTips[currentLanguage]);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const tips = window.iconTips[currentLanguage][randomCategory];
    
    if (tips && tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        if ('serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification(translations[currentLanguage].icons[randomCategory], {
                    body: `${randomTip.name}: ${randomTip.description}`,
                    icon: './assets/icons/android/icon-192.png',
                    tag: 'daily-tip',
                    badge: './assets/icons/android/icon-72.png'
                });
            } catch (error) {
                console.error('Service Worker notification failed:', error);
                // Fallback to regular notifications
                new Notification(translations[currentLanguage].icons[randomCategory], {
                    body: `${randomTip.name}: ${randomTip.description}`,
                    icon: './assets/icons/android/icon-192.png',
                    tag: 'daily-tip'
                });
            }
        } else {
            new Notification(translations[currentLanguage].icons[randomCategory], {
                body: `${randomTip.name}: ${randomTip.description}`,
                icon: './assets/icons/android/icon-192.png',
                tag: 'daily-tip'
            });
        }
    }
}
async setupNoteReminders() {
    // Double check the setting and permission
    if (localStorage.getItem('noteRemindersEnabled') !== 'true') return;
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    if (!('Notification' in window)) return;
    
    // Clear any existing interval
    if (this.noteReminderInterval) {
        clearInterval(this.noteReminderInterval);
    }
    
    // Set up new interval
    this.noteReminderInterval = setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        if (window.notes && window.notes[today] && window.notes[today].length > 0) {
            const count = window.notes[today].length;
            const message = translations[currentLanguage].notesReminder.replace('{count}', count);
            
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(translations[currentLanguage].title, {
                        body: message,
                        icon: './assets/icons/android/icon-192.png',
                        tag: 'notes-reminder',
                        badge: './assets/icons/android/icon-72.png'
                    });
                });
            } else {
                new Notification(translations[currentLanguage].title, {
                    body: message,
                    icon: './assets/icons/android/icon-192.png',
                    tag: 'notes-reminder'
                });
            }
        }
    }, 24 * 60 * 60 * 1000); // Check once per day
    
    // Also check immediately if there are notes for today
    const today = new Date().toISOString().split('T')[0];
    if (window.notes && window.notes[today] && window.notes[today].length > 0) {
        const count = window.notes[today].length;
        const message = translations[currentLanguage].notesReminder.replace('{count}', count);
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(translations[currentLanguage].title, {
                    body: message,
                    icon: './assets/icons/android/icon-192.png',
                    tag: 'notes-reminder',
                    badge: './assets/icons/android/icon-72.png'
                });
            });
        } else {
            new Notification(translations[currentLanguage].title, {
                body: message,
                icon: './assets/icons/android/icon-192.png',
                tag: 'notes-reminder'
            });
        }
    }
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
}
class FileManager {
	static async storeFile(file) {
		// Validate input
		if (!(file instanceof File || file instanceof Blob)) {
			throw new Error(translations[currentLanguage].invalidFileType || 'Invalid file type');
		}
		
		try {
			// First try IndexedDB with retry logic
			let lastError;
			for (let retries = 3; retries > 0; retries--) {
				try {
					const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
					const db = await this.#getDB();
					
					// Create a new transaction for each attempt
					const transaction = db.transaction('attachments', 'readwrite');
					const store = transaction.objectStore('attachments');
					
					// Wrap in Promise to handle transaction completion
					await new Promise((resolve, reject) => {
						const request = store.add({ 
							id, 
							file, 
							timestamp: Date.now(),
							name: file.name,
							type: file.type,
							size: file.size
						});
						
						request.onsuccess = () => resolve();
						request.onerror = (event) => reject(event.target.error);
						transaction.onerror = (event) => reject(event.target.error);
					});
					
					return { id, source: 'indexeddb' };
					} catch (error) {
					lastError = error;
					if (retries > 1) {
						await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries))); // Exponential backoff
					}
				}
			}
			throw lastError; // If all retries failed
			} catch (error) {
			console.warn('IndexedDB failed, falling back to localStorage:', error);
			
			// Enhanced localStorage fallback with size check
			if (file.size > 5 * 1024 * 1024) {
				const errorMsg = translations[currentLanguage].fileTooLarge || 'File too large for fallback storage';
				console.error(errorMsg);
				throw new Error(errorMsg);
			}
			
			try {
				return await new Promise((resolve, reject) => {
					const reader = new FileReader();
					
					reader.onabort = () => reject(new Error(translations[currentLanguage].fileReadAborted || 'File read aborted'));
					reader.onerror = () => reject(new Error(translations[currentLanguage].fileReadError || 'Failed to read file'));
					
					reader.onload = (e) => {
						try {
							const id = `local-${Date.now()}`;
							const fileData = {
								data: e.target.result,
								metadata: {
									name: file.name,
									type: file.type,
									size: file.size,
									lastModified: file.lastModified
								}
							};
							
							localStorage.setItem(id, JSON.stringify(fileData));
							
							const fallbacks = JSON.parse(localStorage.getItem('fallbackFiles') || '[]');
							fallbacks.push({ 
								id,
								name: file.name,
								type: file.type,
								size: file.size,
								timestamp: Date.now()
							});
							localStorage.setItem('fallbackFiles', JSON.stringify(fallbacks));
							
							resolve({ id, source: 'localstorage' });
							} catch (storageError) {
							reject(storageError);
						}
					};
					
					reader.readAsDataURL(file);
				});
				} catch (fallbackError) {
				console.error('LocalStorage fallback failed:', fallbackError);
				throw new Error(translations[currentLanguage].storageFailed || 'Failed to store file in both IndexedDB and localStorage');
			}
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
    console.error('SW Error:', event.error || event.message || 'Unknown error');
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('SW Unhandled Rejection:', event.reason || 'Unknown rejection');
});
/* document.addEventListener('DOMContentLoaded', () => {
    // Run cleanup every 15 days when online
    const lastCleanup = localStorage.getItem('lastCleanup') || 0;
    const cleanupInterval = 15 * 24 * 60 * 60 * 1000; // 15 days
    
    if (Date.now() - lastCleanup > cleanupInterval && navigator.onLine) {
	new AppManager().performSafeCleanup().then(() => {
	localStorage.setItem('lastCleanup', Date.now());
	}).catch(console.error);
    }
}); */