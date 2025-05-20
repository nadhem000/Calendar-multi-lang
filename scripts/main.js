// Initialize the page
// Initialize App Manager
/* import './app-manager.js'; */
// Utility functions for loading indicator
window.currentLanguage = 'en';
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
function handleAppRouting() {
  const path = window.location.pathname;
  
  // Exemple : /event/123 → Affiche l'événement
  if (path.startsWith('/event/')) {
    const eventId = path.split('/')[2];
    showEventDetails(eventId);
  }
  
  // Ajoutez d'autres routes
}

document.addEventListener('DOMContentLoaded', () => {
  handleAppRouting();
  window.addEventListener('hashchange', handleAppRouting);
});



// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = showLoading();
    
    setTimeout(() => {
        try {
            // Load notes first
            if (typeof initNotes === 'function') initNotes();
            // Then render calendar
            renderCalendar(translations[currentLanguage]);
			} catch (error) {
            console.error('Initialization error:', error);
			} finally {
            hideLoading(loadingOverlay);
		}
	}, 50);
    
    // Set up event listeners
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
			currentLanguage = this.value;
			// Force full calendar re-render
			renderCalendar(changeLanguage(currentLanguage));
		});
	}
    if (!window.currentLanguage) {
    window.currentLanguage = 'en'; // Fallback
}
    document.getElementById('next-month')?.addEventListener('click', nextMonth);
    document.getElementById('prev-month')?.addEventListener('click', prevMonth);
    
    ['health-icon', 'plate-icon', 'mechanics-icon'].forEach(id => {
		document.getElementById(id)?.addEventListener('click', function() {
			const category = this.id.replace('-icon', '');
			showTipsModal(category);
		});
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
            renderCalendar(translations[currentLanguage]);
            document.querySelector('.today')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
			});
			} finally {
            hideLoading(loadingOverlay);
		}
	});
}
function updateTodayButton() {
	const today = new Date();
	const todayBtn = document.getElementById('today-btn');
	if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
		todayBtn.disabled = true;
		todayBtn.style.opacity = '0.6';
		} else {
		todayBtn.disabled = false;
		todayBtn.style.opacity = '1';
	}
}
// Toast notification
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Event details - placeholder
function showEventDetails(eventId) {
  console.log('Event details for:', eventId);
  // Implement actual event display logic
}
document.getElementById('calendar-system').addEventListener('change', function() {
	currentCalendarSystem = this.value;
	renderCalendar(translations[currentLanguage]);
});
