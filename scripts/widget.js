// widget.js
const WIDGET_CACHE_NAME = 'widget-data-cache-v9';

// Main widget initialization function
function initWidget() {
  // Initial data load
  updateWidgetData();
  // Set up hourly updates
  setInterval(updateWidgetData, 3600000);
}

// Fetch and display widget data
async function updateWidgetData() {
  try {
    const widgetContainer = document.getElementById('widget-container');
    
    // Network-first strategy
    const networkData = await tryNetworkFetch();
    if (networkData) {
      renderWidget(networkData);
      await cacheWidgetData(networkData);
      return;
    }

    // Cache fallback strategy
    const cachedData = await tryCacheFetch();
    if (cachedData) {
      renderWidget(cachedData);
      showOfflineIndicator(false);
      return;
    }

    // No data available case
    showOfflineIndicator(true);
    
  } catch (error) {
    console.error('Widget update error:', error);
    showOfflineIndicator(true);
  }
}

// Attempt to fetch data from network
async function tryNetworkFetch() {
  try {
    const response = await fetch(`/api/widget-data?t=${Date.now()}`);
    if (!response.ok) throw new Error('Network response not OK');
    return await response.json();
  } catch {
    return null;
  }
}

// Attempt to fetch data from cache
async function tryCacheFetch() {
  try {
    const cache = await caches.open(WIDGET_CACHE_NAME);
    const response = await cache.match('/api/widget-data');
    return response ? await response.json() : null;
  } catch {
    return null;
  }
}

// Cache widget data for offline use
async function cacheWidgetData(data) {
  try {
    const cache = await caches.open(WIDGET_CACHE_NAME);
    await cache.put(
      '/api/widget-data', 
      new Response(JSON.stringify(data))
    );
  } catch (error) {
    console.error('Failed to cache widget data:', error);
  }
}

// Render widget UI with provided data
function renderWidget(data) {
  // Display current date
  document.getElementById('current-date').textContent = 
    new Date().toLocaleDateString(currentLanguage, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });

  // Display daily tip with English fallback
  const tipContainer = document.getElementById('tip-content');
  if (data.tip) {
    tipContainer.innerHTML = `
      <p><strong>${sanitizeHTML(data.tip.name)}</strong></p>
      <p>${sanitizeHTML(data.tip.description)}</p>
      <small>⏰ ${sanitizeHTML((translations[currentLanguage] || translations['en']).delai)}: ${sanitizeHTML(data.tip.delai)}</small>
    `;
  } else {
    tipContainer.textContent = (translations[currentLanguage] || translations['en']).noTipToday;
  }

  // Display notes with English fallback
  const notesContainer = document.getElementById('notes-list');
  if (data.notes?.length > 0) {
    notesContainer.innerHTML = data.notes.map(note => `
      <div class="note-item">
        <p>${sanitizeHTML(note.text.substring(0, 50))}${note.text.length > 50 ? '...' : ''}</p>
      </div>
    `).join('');
  } else {
    notesContainer.textContent = (translations[currentLanguage] || translations['en']).noNotesToday;
  }
}

// Show offline status indicator
function showOfflineIndicator(showFullMessage) {
  const widgetContainer = document.getElementById('widget-container');
  const lang = translations[currentLanguage] || translations['en'];
  
  if (showFullMessage) {
    widgetContainer.innerHTML = `
      <div class="offline-warning">
        ${lang?.offlineMessage || 'Offline - data unavailable'}
      </div>
    `;
  } else {
    const existingIndicator = widgetContainer.querySelector('.offline-badge');
    if (!existingIndicator) {
      const indicator = document.createElement('div');
      indicator.className = 'offline-badge';
      indicator.textContent = lang?.offlineBadge || 'Offline';
      widgetContainer.prepend(indicator);
    }
  }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', initWidget);