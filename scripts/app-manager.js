class AppManager {
	constructor() {
		this.CACHE_NAME = 'calendar-cache-v2';
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
		];
		this.BACKGROUND_SYNC_TAG = 'background-sync';
		this.PERIODIC_SYNC_TAG = 'periodic-sync';
	}
	
	async init() {
		await this.registerServiceWorker();
		this.setupInstallPrompt();
		this.setupStorageManagement();
		this.setupBackgroundSync();
		this.registerPeriodicSync();
		this.setupPushNotifications();
	}
	
	async registerServiceWorker() {
		const isLocalEnvironment = window.location.protocol === 'file:';
		
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
						cacheName: this.CACHE_NAME 
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
	
	async setupBackgroundSync() {
		if ('SyncManager' in window) {
			try {
				const status = await navigator.permissions.query({name: 'background-sync'});
				if (status.state === 'granted') {
					const registration = await navigator.serviceWorker.ready;
					await registration.sync.register(this.BACKGROUND_SYNC_TAG);
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
			if (!['https:', 'http:'].includes(parsed.protocol)) return null;
			if (!parsed.hostname.endsWith('netlify.app')) return null;
			return parsed.toString();
			} catch {
			return null;
		}
	}
}

class FileManager {
	static async processFile(file) {
		const noteDate = new Date().toISOString().split('T')[0];
		
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
		saveNotes();
	}
}

document.addEventListener('DOMContentLoaded', () => {
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