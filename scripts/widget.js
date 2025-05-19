// Initialize widget
function initWidget() {
  updateWidgetData();
  
  // Update every hour
  setInterval(updateWidgetData, 3600000);
}

async function updateWidgetData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch('/api/widget-data');
    const data = await response.json();
    
    // Update date
    document.getElementById('current-date').textContent = 
      new Date().toLocaleDateString(currentLanguage, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
    // Update daily tip
    const tipContainer = document.getElementById('tip-content');
    if (data.tip) {
      tipContainer.innerHTML = `
        <p><strong>${data.tip.name}</strong></p>
        <p>${data.tip.description}</p>
        <small>⏰ ${translations[currentLanguage].delai}: ${data.tip.delai}</small>
      `;
    } else {
      tipContainer.textContent = translations[currentLanguage].noTipToday;
    }
    
    // Update notes
    const notesContainer = document.getElementById('notes-list');
    if (data.notes && data.notes.length > 0) {
      notesContainer.innerHTML = data.notes.map(note => `
        <div class="note-item">
          <p>${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}</p>
        </div>
      `).join('');
    } else {
      notesContainer.textContent = translations[currentLanguage].noNotesToday;
    }
  } catch (error) {
    console.error('Widget update error:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initWidget);