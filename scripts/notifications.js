// notifications.js
/**
 * Handles all notification-related functionality including:
 * - Push notification setup and permission requests
 * - Daily tip notifications
 * - Note reminders
 * - Notification sound effects
 */
class NotificationManager {
    constructor() {
        // Initialize after DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPushNotifications();
            this.setupNotificationClickHandler();
        });
    }

    /**
     * Sets up push notifications and loads user preferences
     */
    async setupPushNotifications() {
        // Check browser support
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('Notifications or Service Workers not supported');
            return;
        }

        try {
            // Get DOM elements for notification settings
            const updateCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(1)');
            const dailyCheckbox = document.querySelector('.settings-notifications-checkbox:nth-of-type(2)');
            const timeInput = document.querySelector('.settings-notifications-time');
            const soundSelect = document.querySelector('.settings-notifications-select');
            
            // Load saved preferences with defaults
            const updatesEnabled = localStorage.getItem('notifyUpdates') === 'true';
            const dailyEnabled = localStorage.getItem('notifyDaily') === 'true';
            const notificationTime = localStorage.getItem('notificationTime') || '09:00';
            const notificationSound = localStorage.getItem('notificationSound') || 'default';
            
            // Apply saved preferences to UI elements if they exist
            if (updateCheckbox) updateCheckbox.checked = updatesEnabled;
            if (dailyCheckbox) dailyCheckbox.checked = dailyEnabled;
            if (timeInput) timeInput.value = notificationTime;
            if (soundSelect) soundSelect.value = notificationSound;
            
            console.debug('Notification settings loaded from storage');

            // Request permission if not already determined
            if (Notification.permission === 'default') {
                const lang = (translations[currentLanguage] || translations['en']); // Fallback to English
                const promptText = lang.enableNotifications || "Would you like to enable notifications?";
                
                if (confirm(promptText)) {
                    const permission = await Notification.requestPermission();
                    console.log('Notification permission:', permission);
                    
                    if (permission === 'granted') {
                        // Enable notifications by default if user confirms
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
            console.error('Error initializing notifications:', error);
            showToast('Error initializing notifications');
        }
    }

    /**
     * Schedules daily notifications at user-specified time
     */
    scheduleDailyNotifications() {
        // Clear existing interval to prevent duplicates
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
        
        // Schedule for next day if time already passed today
        if (now > firstNotification) {
            firstNotification.setDate(firstNotification.getDate() + 1);
        }
        
        const timeout = firstNotification.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showDailyTipNotification();
            // Set daily repeating interval
            this.dailyNotificationInterval = setInterval(
                () => this.showDailyTipNotification(),
                24 * 60 * 60 * 1000 // 24 hours
            );
        }, timeout);
    }

    /**
     * Shows a random daily tip notification
     */
    showDailyTipNotification() {
        this.playNotificationSound();
        if ('Notification' in window && window.iconTips && window.iconTips[currentLanguage || 'en']) { // Fallback to English
            const lang = (translations[currentLanguage] || translations['en']); // Fallback to English
            const categories = Object.keys(window.iconTips[currentLanguage || 'en']);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const tips = window.iconTips[currentLanguage || 'en'][randomCategory];
            
            if (tips && tips.length > 0) {
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                const notification = new Notification(lang.icons[randomCategory] || randomCategory, {
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

    /**
     * Sets up reminders for notes created today
     */
    setupNoteReminders() {
        setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            if (window.notes && window.notes[today] && window.notes[today].length > 0) {
                const lang = (translations[currentLanguage] || translations['en']); // Fallback to English
                const notification = new Notification(lang.title || 'Calendar App', {
                    body: (lang.notesReminder || 'You have {count} notes for today').replace('{count}', window.notes[today].length),
                    icon: './assets/icons/android/icon-192.png',
                    tag: 'notes-reminder'
                });
            }
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Shows update notification when new version is available
     */
    showUpdateNotification() {
        this.playNotificationSound();
        const lang = (translations[currentLanguage] || translations['en']); // Fallback to English
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(lang.updateAvailable || 'Update Available', {
                body: lang.reloadPrompt || 'A new version is available. Click to reload.',
                icon: './assets/icons/android/icon-192.png',
                tag: 'update-notification'
            });
            
            notification.onclick = () => {
                window.location.reload();
            };
        } else {
            // Fallback UI for browsers without Notification support
            const notification = document.createElement('div');
            notification.className = 'update-notification';
            notification.innerHTML = `
                <p>${lang.updateAvailable || 'New version available!'}</p>
                <button id="reload-app">${lang.reload || 'Reload'}</button>
            `;
            document.body.appendChild(notification);
            document.getElementById('reload-app').addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    /**
     * Handles service worker messages (e.g., network errors)
     */
    setupNotificationClickHandler() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'NETWORK_ERROR') {
                    showToast(event.data.message);
                }
            });
        }
    }

    /**
     * Shows a test notification for debugging purposes
     */
    showTestNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.playNotificationSound();
                new Notification("Test Notification", {
                    body: "This is a test notification from calendar app",
                    icon: './assets/icons/android/icon-192.png'
                });
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showTestNotification();
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

    /**
     * Plays notification sound based on user preference
     */
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
                    console.warn('Sound playback failed:', e);
                    // Fallback to default sound
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

// Initialize notification manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});