// Initialize the page
window.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
window.currentCalendarSystem = localStorage.getItem('calendarSystem') || 'gregorian';

// Utility functions
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoading(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

function updateTodayButton() {
    const today = new Date();
    const todayBtn = document.getElementById('today-btn');
    if (!todayBtn) return;
    
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
        todayBtn.disabled = true;
        todayBtn.style.opacity = '0.6';
    } else {
        todayBtn.disabled = false;
        todayBtn.style.opacity = '1';
    }
}

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// Routing functionality
function handleAppRouting() {
    const path = window.location.pathname;
    
    if (path === '/share-target') {
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('text') || params.get('url');
        if (sharedData) {
            window.location.href = `/?shared=${encodeURIComponent(sharedData)}`;
        }
        return;
    }

    if (path === '/health-tips') {
        showTipsModal('health');
        return;
    }

    if (path === '/today-note') {
        const today = new Date();
        openNoteModal(today);
        return;
    }

    if (path.startsWith('/event/')) {
        const eventId = path.split('/')[2];
        showEventDetails(eventId);
    }
}

function showEventDetails(eventId) {
    console.log('Event details for:', eventId);
    // Implement actual event display logic
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = window.currentLanguage;
        languageSelect.addEventListener('change', function() {
            window.currentLanguage = this.value;
            localStorage.setItem('selectedLanguage', window.currentLanguage);
            
            // Notify service worker
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SET_LANGUAGE',
                    language: window.currentLanguage
                });
            }
            
            renderCalendar(translations[window.currentLanguage]);
        });
    }

    // Initialize calendar system select
    const calendarSystemSelect = document.getElementById('calendar-system');
    if (calendarSystemSelect) {
        calendarSystemSelect.value = window.currentCalendarSystem;
        calendarSystemSelect.addEventListener('change', function() {
            window.currentCalendarSystem = this.value;
            localStorage.setItem('calendarSystem', window.currentCalendarSystem);
            renderCalendar(translations[window.currentLanguage]);
        });
    }

    // Initialize settings manager with cleanup toggle
    window.settingsManager = new SettingsManager();
    window.settingsManager.setupAutoCleanupToggle();
    window.settingsManager.setupPeriodicCleanup();
    // Set up routing
    handleAppRouting();
    window.addEventListener('hashchange', handleAppRouting);

    // Initialize with loading indicator
    const loadingOverlay = showLoading();
    
    setTimeout(() => {
        try {
            // Load notes first
            if (typeof initNotes === 'function') initNotes();
            // Then render calendar
            renderCalendar(translations[window.currentLanguage]);
        } catch (error) {
            console.error('Initialization error:', error);
        } finally {
            hideLoading(loadingOverlay);
        }
    }, 50);
    
    // Set up navigation buttons
    document.getElementById('next-month')?.addEventListener('click', nextMonth);
    document.getElementById('prev-month')?.addEventListener('click', prevMonth);
    
    // Set up icon click handlers
    ['health-icon', 'plate-icon', 'mechanics-icon'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', function() {
            const category = this.id.replace('-icon', '');
            showTipsModal(category);
        });
    });

    // Today button handler
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            const loadingOverlay = showLoading();
            try {
                const today = new Date();
                currentYear = today.getFullYear();
                currentMonth = today.getMonth();
                renderCalendar(translations[window.currentLanguage]);
                document.querySelector('.today')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            } finally {
                hideLoading(loadingOverlay);
            }
        });
    }

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    showToast(navigator.onLine ? 'Online' : 'Offline');
}
    // Initialize service worker
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.active?.postMessage({
            type: 'SET_LANGUAGE',
            language: window.currentLanguage
        });
    }).catch(err => {
        console.log('ServiceWorker registration failed: ', err);
    });
}
});