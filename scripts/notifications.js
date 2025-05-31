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
    if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
            // Wait for DOM to be ready
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });

            // Check if elements exist before accessing them
            const updateCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(1)');
            const dailyCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(2)');
            
            if (updateCheckbox && dailyCheckbox) {
                // Load saved preferences
                const updatesEnabled = localStorage.getItem('notifyUpdates') === 'true';
                const dailyEnabled = localStorage.getItem('notifyDaily') === 'true';
                
                // Set initial toggle states
                updateCheckbox.checked = updatesEnabled;
                dailyCheckbox.checked = dailyEnabled;
            }

            // Only request permission if not already determined
            if (Notification.permission === 'default') {
                // Show a custom prompt first
                if (confirm("Would you like to enable notifications?")) {
                    const permission = await Notification.requestPermission();
                    console.log('Notification permission:', permission);
                }
            } else if (Notification.permission === 'granted') {
                const dailyEnabled = localStorage.getItem('notifyDaily') === 'true';
                const updatesEnabled = localStorage.getItem('notifyUpdates') === 'true';
                if (dailyEnabled) this.scheduleDailyNotifications();
                if (updatesEnabled) this.setupNoteReminders();
            }
        } catch (error) {
            console.error('Error with notifications:', error);
        }
    }
}
    scheduleDailyNotifications() {
        const now = new Date();
        const firstNotification = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            9, 0, 0
		);
        if (now > firstNotification) {
            firstNotification.setUTCDate(firstNotification.getDate() + 1);
		}
        const timeout = firstNotification.getTime() - now.getTime();
        setTimeout(() => {
            this.showDailyTipNotification();
            setInterval(() => this.showDailyTipNotification(), 24 * 60 * 60 * 1000);
		}, timeout);
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
}
// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});