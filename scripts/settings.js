// settings.js
class SettingsManager {
    constructor() {
        this.modal = document.getElementById('settings-modal');
        this.initSettingsButton();
        this.initModal();
        // Initialize calendar settings
        window.calendarSettings = new CalendarSettings(this);
    }
    initSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
    }
    initModal() {
        // Close modal when clicking X
        this.modal.querySelector('.close-modal').addEventListener('click', () => this.closeSettings());
        // Close when clicking outside modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeSettings();
        });
        // Tab switching 
        document.querySelectorAll('.settings-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Hide all sub-views when switching tabs
                document.querySelectorAll('[id$="-view"]').forEach(view => {
                    view.classList.add('hidden');
                });
                // Remove active class from all buttons
                document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
                // Remove active class from all content
                document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Show corresponding content
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
                // Hide any open sub-views when switching tabs
                document.getElementById('memory-monitor-view').classList.add('hidden');
                document.getElementById('clear-partial-view').classList.add('hidden');
            });
        });
        // Language select listener
        const langSelectSettings = this.modal.querySelector('#language-select-settings');
        if (langSelectSettings) {
            langSelectSettings.value = window.currentLanguage;
            langSelectSettings.addEventListener('change', function() {
                window.currentLanguage = this.value;
                localStorage.setItem('selectedLanguage', window.currentLanguage);
                renderCalendar(translations[window.currentLanguage]);
                window.settingsManager.updateLanguageTexts();
            });
        }
        // Initialize calendar settings
        window.calendarSettings = new CalendarSettings(this);
        // Add notification toggle listeners
        document.querySelectorAll('.settings-notifications-checkbox').forEach((checkbox, index) => {
            checkbox.addEventListener('change', (e) => {
                const key = index === 0 ? 'notifyUpdates' : 'notifyDaily';
                localStorage.setItem(key, e.target.checked);
                console.log(`${key} set to ${e.target.checked}`);
                // Restart notifications if needed
                if (index === 1 && e.target.checked) {
                    window.notificationManager.scheduleDailyNotifications();
                }
            });
        });
        // Add notification time listener
        const timeInput = document.querySelector('.settings-notifications-time');
        if (timeInput) {
            // Initialize from localStorage
            const savedTime = localStorage.getItem('notificationTime') || '09:00';
            timeInput.value = savedTime;
            timeInput.addEventListener('change', (e) => {
                localStorage.setItem('notificationTime', e.target.value);
            });
        }
        // Add notification sound listener
        const soundSelect = document.querySelector('.settings-notifications-select');
        if (soundSelect) {
            // Initialize from localStorage
            const savedSound = localStorage.getItem('notificationSound') || 'default';
            soundSelect.value = savedSound;
            soundSelect.addEventListener('change', (e) => {
                localStorage.setItem('notificationSound', e.target.value);
            });
        }
        // Add test button listener
        document.querySelector('.settings-notifications-test-btn').addEventListener('click', () => {
            window.notificationManager.showTestNotification();
        });
    }
    openSettings() {
        this.modal.style.display = 'block';
        this.updateLanguageTexts();
        // Refresh notification toggle states
        const checkboxes = this.modal.querySelectorAll('.settings-notifications-checkbox');
        if (checkboxes.length >= 2) {
            checkboxes[0].checked = localStorage.getItem('notifyUpdates') === 'true';
            checkboxes[1].checked = localStorage.getItem('notifyDaily') === 'true';
        }
        // Refresh time and sound settings
        const timeInput = this.modal.querySelector('.settings-notifications-time');
        const soundSelect = this.modal.querySelector('.settings-notifications-select');
        if (timeInput) timeInput.value = localStorage.getItem('notificationTime') || '09:00';
        if (soundSelect) soundSelect.value = localStorage.getItem('notificationSound') || 'default';
        // Initialize synchronization manager if not already done
        if (window.synchronizationManager && !window.synchronizationManager.initialized) {
            window.synchronizationManager.initialize();
        }
    }
    closeSettings() {
        this.modal.style.display = 'none';
        // Hide any open sub-views
        document.getElementById('memory-monitor-view').classList.add('hidden');
        document.getElementById('clear-partial-view').classList.add('hidden');
    }
    updateLanguageTexts() {
        const lang = translations[currentLanguage];
        this.modal.querySelector('#settings-title').textContent = lang.title || 'Settings';
        // Language tab
        document.querySelector('[data-tab="language"]').textContent = lang.language || 'Language';
        document.querySelector('#language-tab h3').textContent = lang.languageSettings || 'Language Settings';
        document.querySelector('.language-text').textContent = lang.applicationLanguage || 'Application Language';
        // Update language select options
        const langSelect = this.modal.querySelector('#language-select-settings');
        if (langSelect) {
            Array.from(langSelect.options).forEach(option => {
                if (option.value === 'en') option.text = lang.english || 'English';
                if (option.value === 'ar') option.text = lang.arabic || 'العربية (Arabic)';
                if (option.value === 'fr') option.text = lang.french || 'Français (French)';
            });
            langSelect.value = window.currentLanguage;
        }
        // Update calendar settings
        if (window.calendarSettings) window.calendarSettings.updateLanguageTexts();
        if (window.memoryManager) window.memoryManager.updateLanguageTexts();
        if (window.researchManager) window.researchManager.updateLanguageTexts();

        // Preserve notification settings when language changes
        const timeInput = document.querySelector('.settings-notifications-time');
        const soundSelect = document.querySelector('.settings-notifications-select');
        const savedTime = timeInput ? timeInput.value : '09:00';
        const savedSound = soundSelect ? soundSelect.value : 'default';
        // Memory tab
        document.querySelector('[data-tab="memory"]').textContent = lang.memory || 'Memory';
        // Periodic Activities tab
        document.querySelector('[data-tab="periodic"]').textContent = lang.periodicActivities || 'Periodic Activities';
        // Notifications tab
        document.querySelector('[data-tab="notifications"]').textContent = lang.notificationSettings || 'Notifications';
        document.querySelector('.settings-notifications-title').textContent = lang.notificationSettings || 'Notification Settings';
        document.querySelectorAll('.settings-notifications-label .notification-text')[0].textContent = lang.enableUpdateReminders || 'Enable updates reminders';
        document.querySelectorAll('.settings-notifications-tooltip')[0].textContent = lang.updateRemindersTooltip || 'Get reminders when updates are available';
        document.querySelectorAll('.settings-notifications-label .notification-text')[1].textContent = lang.enableDailyNotifications || 'Enable daily notifications';
        document.querySelectorAll('.settings-notifications-tooltip')[1].textContent = lang.dailyNotificationsTooltip || 'Receive daily summary notifications';
        document.querySelectorAll('.settings-notifications-label .notification-text')[2].textContent = lang.notificationSound || 'Notification sound';
        document.querySelectorAll('.settings-notifications-label .notification-text')[3].textContent = lang.notificationTime || 'Notification time';
        // Restore values after language update
        if (timeInput) timeInput.value = savedTime;
        if (soundSelect) soundSelect.value = savedSound;
        // Close button
        this.modal.querySelector('.close-modal').textContent = lang.close || '×';
        // Sync options (if they exist)
        if (document.querySelector('.settings-sync-options-section h3')) {
            document.querySelector('.settings-sync-options-section h3').textContent = lang.synchronization || 'Synchronization';
        }
        // Update synchronization section
        if (window.synchronizationManager) {
            window.synchronizationManager.updateLanguageTexts();
        }
    }
    addTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        element.appendChild(tooltip);
        element.addEventListener('mouseenter', () => {
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    }
}
// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});