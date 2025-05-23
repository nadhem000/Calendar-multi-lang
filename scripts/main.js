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
    
    // Load saved language or use default
    const savedLanguage = localStorage.getItem('userLanguage') || 'en';
    currentLanguage = savedLanguage;
    
    // Update language select to match saved language
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        
        languageSelect.addEventListener('change', function() {
            if (this.value !== currentLanguage) { // Only change if different
                currentLanguage = this.value;
                // Force full calendar re-render
                renderCalendar(changeLanguage(currentLanguage));
            }
        });
    }
    
  // Settings modal handling
  const settingsIcon = document.getElementById('settings-icon');
  const settingsModal = document.getElementById('settings-modal');
  
  settingsIcon.addEventListener('click', function() {
    // Sync settings with current state
    document.getElementById('language-select').value = currentLanguage;
    document.getElementById('calendar-system').value = currentCalendarSystem;
    settingsModal.style.display = 'block';
  });

  // Close modal
  document.getElementById('settings-close').addEventListener('click', function() {
    settingsModal.style.display = 'none';
  });
    setTimeout(() => {
        try {
            // Load notes first
            if (typeof initNotes === 'function') initNotes();
            // Then render calendar with correct language
            renderCalendar(changeLanguage(currentLanguage));
        } catch (error) {
            console.error('Initialization error:', error);
        } finally {
            hideLoading(loadingOverlay);
        }
    }, 50);
    
    // Rest of your existing event listeners...
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
// Add to main.js
function handleAppRouting() {
  const path = window.location.pathname;
  
  // Handle share target
  if (path === '/share-target') {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('text') || params.get('url');
    if (sharedData) {
      // Redirect to note creation with shared content
      window.location.href = `/?shared=${encodeURIComponent(sharedData)}`;
    }
    return;
  }

  // Handle file protocol
  if (path === '/handle-file') {
    // Implement file handling logic
    console.log('File handler triggered');
    return;
  }

  // Handle note with attachment
  if (path === '/note-with-attachment') {
    // Show note with attachment view
    document.body.innerHTML = '<h1>Note with Attachment</h1>'; // Replace with actual UI
    return;
  }

  // Health tips shortcut
  if (path === '/health-tips') {
    showTipsModal('health');
    return;
  }

  // Today's note shortcut
  if (path === '/today-note') {
    const today = new Date();
    openNoteModal(today);
    return;
  }

  // Protocol handler
  if (path === '/handle-protocol') {
    const urlParams = new URLSearchParams(window.location.search);
    const externalUrl = urlParams.get('url');
    if (externalUrl) {
      // Validate and handle the URL
      if (externalUrl.startsWith('web+calmultilang://')) {
        // Parse and handle your protocol-specific URL
        console.log('Handling protocol URL:', externalUrl);
      }
    }
    return;
  }
}
// Event details - placeholder
function showEventDetails(eventId) {
  console.log('Event details for:', eventId);
  // Implement actual event display logic
}
document.getElementById('enable-notifications')?.addEventListener('click', () => {
  if (window.appManager) {
    appManager.setupPushNotifications();
  }
});
document.getElementById('calendar-system').addEventListener('change', function() {
	currentCalendarSystem = this.value;
	renderCalendar(translations[currentLanguage]);
});
