// Initialize the page
window.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
window.currentCalendarSystem = localStorage.getItem('calendarSystem') || 'gregorian';
// Utility functions
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
    // Create or show modal
    const modal = document.getElementById('event-details-modal') || 
	createEventDetailsModal();
    
    // Fetch or find event data (placeholder implementation)
    const event = findEventById(eventId) || {
        title: 'Event ' + eventId,
        date: new Date().toLocaleDateString(),
        description: 'Event details not available'
	};
	
    // Populate modal
    modal.querySelector('.event-title').textContent = event.title;
    modal.querySelector('.event-date').textContent = event.date;
    modal.querySelector('.event-description').textContent = event.description;
    
    // Show modal
    modal.style.display = 'block';
}

function createEventDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'event-details-modal';
    modal.className = 'modal';
    modal.innerHTML = `
	<div class="modal-content">
	<span class="close-modal">&times;</span>
	<h2 class="event-title"></h2>
	<p class="event-date"></p>
	<p class="event-description"></p>
	</div>
    `;
    document.body.appendChild(modal);
    
    // Add close handler
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
	});
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.style.display = 'none';
		}
	});
    
    return modal;
}
// Main initialization - wrap everything in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
	console.log('Environment:', window.location.hostname);
	console.log('Scripts loaded:', {
		languages: typeof translations,
		calendar: typeof renderCalendar,
		notes: typeof initNotes
	});
	console.log('DOM elements ready:', {
		nextMonthBtn: !!document.getElementById('next-month'),
		prevMonthBtn: !!document.getElementById('prev-month'),
		todayBtn: !!document.getElementById('today-btn')
	});
    // Initialize language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = window.currentLanguage;
        languageSelect.addEventListener('change', function() {
            window.currentLanguage = this.value;
            localStorage.setItem('selectedLanguage', window.currentLanguage);
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
	
    // Set up navigation buttons - only if they exist
    const nextMonthBtn = document.getElementById('next-month');
    const prevMonthBtn = document.getElementById('prev-month');
    
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', nextMonth);
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', prevMonth);
	
    // Set up icon click handlers - only if they exist
    ['health-icon', 'plate-icon', 'mechanics-icon'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function() {
                const category = this.id.replace('-icon', '');
                showTipsModal(category);
			});
		}
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
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('message', (event) => {
			if (event.data.type === 'NETWORK_ERROR') {
				showToast(event.data.message);
			}
		});
	}
    // Initialize with loading indicator
    const loadingOverlay = showLoading();
    
    // In the setTimeout callback:
	setTimeout(() => {
		try {
			if (typeof initNotes === 'function') initNotes();
			if (typeof renderCalendar === 'function') {
				renderCalendar(translations[window.currentLanguage]);
			}
			} catch (error) {
			console.error('Initialization error:', error);
			showToast('Failed to initialize calendar');
			} finally {
			hideLoading(loadingOverlay);
		}
	}, 50);
});

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

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}
// Wrap critical functions
function safeRenderCalendar() {
    try {
        if (typeof renderCalendar === 'function') {
            renderCalendar(translations[window.currentLanguage]);
		}
		} catch (e) {
        console.error('Calendar render failed:', e);
        showToast('Calendar error - please refresh');
	}
}
function updateOnlineStatus() {
    const statusElement = document.getElementById('online-status');
    if (!statusElement) return;
    
    if (navigator.onLine) {
        statusElement.className = 'online';
        statusElement.title = translations[currentLanguage].onlineStatus || 'Online';
		} else {
        statusElement.className = 'offline';
        statusElement.title = translations[currentLanguage].offlineStatus || 'Offline';
        if (localStorage.getItem('syncStorage') === 'true') {
            showToast(translations[currentLanguage].offlineSave || 'Working offline - changes will sync when online');
		}
	}
}
// Performance metrics
window.addEventListener('load', () => {
	setTimeout(() => {
		const timing = performance.timing;
		const loadTime = timing.loadEventEnd - timing.navigationStart;
		console.log('Page load time:', loadTime + 'ms');
		
		// Log resource timing
		performance.getEntriesByType('resource').forEach(resource => {
			console.log(`${resource.name} loaded in ${resource.duration}ms`);
		});
	}, 0);
});