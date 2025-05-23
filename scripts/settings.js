/* // Settings functionality
document.addEventListener('DOMContentLoaded', function() {
  const settingsIcon = document.getElementById('settings-icon');
  const settingsModal = document.getElementById('settings-modal');
  const settingsBadge = document.getElementById('settings-badge');
  
  // Load saved settings
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Language
    /* if (settings.language) {
      document.getElementById('language-selector').value = settings.language;
    } */
    
    // Notifications
    document.getElementById('notifications-toggle').checked = 
      settings.notificationsEnabled || false;
      
    // Push notifications
    document.getElementById('push-toggle').checked = 
      settings.pushEnabled || false;
      
    // Updates
    document.getElementById('updates-selector').value = 
      settings.updatePreference || 'auto';
      
    // Calendar system
    document.getElementById('calendar-system-selector').value = 
      settings.calendarSystem || 'gregorian';
      
    // Sync mode
    document.getElementById('sync-selector').value = 
      settings.syncMode || 'auto';
  }
  
  // Save settings
  function saveSettings() {
    const settings = {
      language: document.getElementById('language-selector').value,
      notificationsEnabled: document.getElementById('notifications-toggle').checked,
      pushEnabled: document.getElementById('push-toggle').checked,
      updatePreference: document.getElementById('updates-selector').value,
      calendarSystem: document.getElementById('calendar-system-selector').value,
      syncMode: document.getElementById('sync-selector').value
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    settingsBadge.style.display = 'none';
    
    // Apply language change immediately
    /* if (window.changeLanguage && settings.language !== currentLanguage) {
      changeLanguage(settings.language);
    } */
    
    // Apply calendar system change
    if (window.currentCalendarSystem !== settings.calendarSystem) {
      currentCalendarSystem = settings.calendarSystem;
      if (window.renderCalendar) {
        renderCalendar(translations[currentLanguage]);
      }
    }
    
    // Show confirmation
    showToast(translations[currentLanguage].settingsSaved || 'Settings saved');
  }
  
  // Toggle modal
  settingsIcon.addEventListener('click', function() {
    loadSettings();
    settingsModal.style.display = 'block';
  });
  
  // Save button
  document.getElementById('settings-save').addEventListener('click', function() {
    saveSettings();
    settingsModal.style.display = 'none';
  });
  
  // Cancel button
  document.getElementById('settings-cancel').addEventListener('click', function() {
    settingsModal.style.display = 'none';
  });
  
  // Personal info button
  document.getElementById('personal-info-btn').addEventListener('click', function() {
    showToast('Personal information feature coming soon!');
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  // Check if settings need attention (example)
  if (!localStorage.getItem('appSettings')) {
    settingsBadge.style.display = 'block';
  }
}); */