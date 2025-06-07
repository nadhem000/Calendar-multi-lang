const WIDGET_CACHE_NAME = 'widget-data-cache-v7';

// Initialize widget with offline support
function initWidget() {
  updateWidgetData();
  setInterval(updateWidgetData, 3600000); // Still update hourly when online
}

async function updateWidgetData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const widgetContainer = document.getElementById('widget-container');
    
    // Try network first
    const networkData = await tryNetworkFetch();
    if (networkData) {
      renderWidget(networkData);
      await cacheWidgetData(networkData);
      return;
    }

    // Fallback to cache
    const cachedData = await tryCacheFetch();
    if (cachedData) {
      renderWidget(cachedData);
      showOfflineIndicator(false); // Show subtle offline indicator
      return;
    }

    // No cached data available
    showOfflineIndicator(true);
    
  } catch (error) {
    console.error('Widget update error:', error);
    showOfflineIndicator(true);
  }
}

async function tryNetworkFetch() {
  try {
    const response = await fetch(`/api/widget-data?t=${Date.now()}`);
    if (!response.ok) throw new Error('Network response not OK');
    return await response.json();
  } catch {
    return null;
  }
}

async function tryCacheFetch() {
  try {
    const cache = await caches.open(WIDGET_CACHE_NAME);
    const response = await cache.match('/api/widget-data');
    return response ? await response.json() : null;
  } catch {
    return null;
  }
}

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

function renderWidget(data) {
  // Update date
  document.getElementById('current-date').textContent = 
    new Date().toLocaleDateString(currentLanguage, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC' // Add explicit timezone
    });

  // Update daily tip
  const tipContainer = document.getElementById('tip-content');
  if (data.tip) {
    tipContainer.innerHTML = `
      <p><strong>${sanitizeHTML(data.tip.name)}</strong></p>
      <p>${sanitizeHTML(data.tip.description)}</p>
      <small>⏰ ${sanitizeHTML(translations[currentLanguage].delai)}: ${sanitizeHTML(data.tip.delai)}</small>
    `;
  } else {
    tipContainer.textContent = translations[currentLanguage].noTipToday;
  }

  // Update notes
  const notesContainer = document.getElementById('notes-list');
  if (data.notes?.length > 0) {
    notesContainer.innerHTML = data.notes.map(note => `
      <div class="note-item">
        <p>${sanitizeHTML(note.text.substring(0, 50))}${note.text.length > 50 ? '...' : ''}</p>
      </div>
    `).join('');
  } else {
    notesContainer.textContent = translations[currentLanguage].noNotesToday;
  }
}

function showOfflineIndicator(showFullMessage) {
  const widgetContainer = document.getElementById('widget-container');
  if (showFullMessage) {
    widgetContainer.innerHTML = `
      <div class="offline-warning">
        ${translations[currentLanguage]?.offlineMessage || 'Offline - data unavailable'}
      </div>
    `;
  } else {
    const existingIndicator = widgetContainer.querySelector('.offline-badge');
    if (!existingIndicator) {
      const indicator = document.createElement('div');
      indicator.className = 'offline-badge';
      indicator.textContent = translations[currentLanguage]?.offlineBadge || 'Offline';
      widgetContainer.prepend(indicator);
    }
  }
}

document.addEventListener('DOMContentLoaded', initWidget);