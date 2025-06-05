// notifications.js
class NotificationManager {
    constructor() {
        // wait for DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPushNotifications();
            this.setupNotificationClickHandler();
        });
	}

    async setupPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.log('Notifications or Service Workers not supported');
        return;
    }

    try {
        // Ensure elements exist before accessing them
        const updateCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(1)');
        const dailyCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(2)');
        const timeInput = document.querySelector('.settings-notifications-time');
        const soundSelect = document.querySelector('.settings-notifications-select');
        
        // Load saved preferences
        const updatesEnabled = localStorage.getItem('notifyUpdates') === 'true';
        const dailyEnabled = localStorage.getItem('notifyDaily') === 'true';
        const notificationTime = localStorage.getItem('notificationTime') || '09:00';
        const notificationSound = localStorage.getItem('notificationSound') || 'default';
        
        // Set initial values if elements exist
        if (updateCheckbox) updateCheckbox.checked = updatesEnabled;
        if (dailyCheckbox) dailyCheckbox.checked = dailyEnabled;
        if (timeInput) timeInput.value = notificationTime;
        if (soundSelect) soundSelect.value = notificationSound;
        
        console.log(`Notification settings loaded:`, {
            updatesEnabled,
            dailyEnabled,
            notificationTime,
            notificationSound
        });

        // Only request permission if not already determined
        if (Notification.permission === 'default') {
            // Show a custom prompt first
            const lang = translations[currentLanguage] || translations['en'];
            const promptText = lang.enableNotifications || "Would you like to enable notifications?";
            
            if (confirm(promptText)) {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
                
                // Update UI based on permission
                if (permission === 'granted') {
                    // Set to enabled if user confirmed
                    localStorage.setItem('notifyUpdates', 'true');
                    localStorage.setItem('notifyDaily', 'true');
                    
                    if (updateCheckbox) updateCheckbox.checked = true;
                    if (dailyCheckbox) dailyCheckbox.checked = true;
                }
            }
        } else if (Notification.permission === 'granted') {
            // Enable scheduled notifications based on preferences
            if (dailyEnabled) this.scheduleDailyNotifications();
            if (updatesEnabled) this.setupNoteReminders();
        }
    } catch (error) {
        console.error('Error with notifications:', error);
        showToast('Error initializing notifications');
    }
}
    scheduleDailyNotifications() {
    // Clear any existing intervals
    if (this.dailyNotificationInterval) {
        clearInterval(this.dailyNotificationInterval);
    }
    
    const notificationTime = localStorage.getItem('notificationTime') || '09:00';
    const [hours, minutes] = notificationTime.split(':').map(Number);
    
    const now = new Date();
    let firstNotification = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0
    );
    
    // If we already passed the time today, schedule for tomorrow
    if (now > firstNotification) {
        firstNotification.setDate(firstNotification.getDate() + 1);
    }
    
    const timeout = firstNotification.getTime() - now.getTime();
    
    setTimeout(() => {
        this.showDailyTipNotification();
        // Set interval for daily notifications
        this.dailyNotificationInterval = setInterval(
            () => this.showDailyTipNotification(),
            24 * 60 * 60 * 1000 // 24 hours
        );
    }, timeout);
	}
    showDailyTipNotification() {
    this.playNotificationSound();
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
    this.playNotificationSound();
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
    setupNotificationClickHandler() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'NETWORK_ERROR') {
                    showToast(event.data.message);
				}
			});
		}
	}
    showTestNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                 this.playNotificationSound();
                new Notification("Test Notification", {
                    body: "This is a test notification from calendar app",
                    icon: './assets/icons/android/icon-192.png'
                });
            } else if (Notification.permission === 'default') {
                // Request permission first
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showTestNotification(); // Retry now that we have permission
                    } else {
                        showToast("Please enable notifications in your browser settings");
                    }
                });
            } else {
                showToast("Please enable notifications in your browser settings");
            }
        } else {
            showToast("Notifications not supported in this browser");
        }
    }

     playNotificationSound() {
         try {
             const soundPref = localStorage.getItem('notificationSound') || 'default';
             if (soundPref === 'none') return;
             
             const sounds = {
                 'default': '/assets/sounds/background.mp3',
                 'chime': '/assets/sounds/Violin_and_Piano_Harmony.mp3',
                 'bell': '/assets/sounds/Ocean_Breeze.mp3'
             };
             
             if (sounds[soundPref]) {
                 const audio = new Audio(sounds[soundPref]);
                 audio.play().catch(e => {
                     console.log('Sound playback failed:', e);
                     // Fallback to default if preferred sound fails
                     if (soundPref !== 'default') {
                         new Audio(sounds['default']).play().catch(console.error);
                     }
                 });
             }
         } catch (e) {
             console.error('Error playing notification sound:', e);
         }
     }
}
// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});