// Initialize the page
// Initialize App Manager
/* import './app-manager.js'; */
// Utility functions for loading indicator
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
    
    document.getElementById('next-month')?.addEventListener('click', nextMonth);
    document.getElementById('prev-month')?.addEventListener('click', prevMonth);
    
    ['plate-icon', 'health-icon', 'mechanics-icon'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            setTimeout(() => alert(`${id.replace('-icon', '')} icon clicked!`), 0);
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
document.getElementById('calendar-system').addEventListener('change', function() {
	currentCalendarSystem = this.value;
	renderCalendar(translations[currentLanguage]);
});
