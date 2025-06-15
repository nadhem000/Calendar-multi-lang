// scripts/footer.js
// scripts/footer.js
document.addEventListener('DOMContentLoaded', function() {
    // Get version from either:
    // 1. Cache name in config
    // 2. window.APP_VERSION
    // 3. Default fallback
    const getAppVersion = () => {
        // Try to get from cache config name
        try {
            if (window.CACHE_CONFIG) {
                const versionMatch = window.CACHE_CONFIG.name.match(/v(\d+)/);
                if (versionMatch) {
                    const versionNum = versionMatch[1];
                    console.debug('Parsed version from CACHE_CONFIG:', versionNum);
                    // Convert "v9" to "0.0.9" format
                    return `0.0.${versionNum}`;
                }
            }
        } catch (e) {
            console.warn('Could not parse version from CACHE_CONFIG:', e);
        }
        
        // Try to get from window config
        if (window.APP_VERSION) {
            console.debug('Using version from window.APP_VERSION');
            return window.APP_VERSION;
        }
        
        console.debug('Using fallback version');
        return '0.0.9';
    };

    // Update version display
    const versionElement = document.getElementById('version-display');
    if (versionElement) {
        versionElement.textContent = `Version: ${getAppVersion()}`;
    }

    // Downloads display
    const downloadsElement = document.getElementById('downloads-display');
    if (downloadsElement) {
        fetchDownloadsCount().then(count => {
            downloadsElement.textContent = `Downloads: ${count.toLocaleString()}`;
        }).catch(() => {
            downloadsElement.textContent = 'Downloads: Offline';
        });
    }

    // Fetch downloads count with caching
    async function fetchDownloadsCount() {
        /* try {
            // Check cache first
            const cacheKey = 'downloads-count';
            const cached = localStorage.getItem(cacheKey);
            const cachedTime = localStorage.getItem(`${cacheKey}-time`);
            
            // If cached and less than 1 hour old, use it
            if (cached && cachedTime && Date.now() - cachedTime < 3600000) {
                return parseInt(cached);
            }
            
            // Otherwise fetch fresh data
            const response = await fetch('https://calendar-multi-lang.netlify.app/.netlify/functions/downloads');
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            const count = data.count || 0;
            
            // Update cache
            localStorage.setItem(cacheKey, count.toString());
            localStorage.setItem(`${cacheKey}-time`, Date.now().toString());
            
            return count;
        } catch (error) {
            console.error('Error fetching downloads count:', error);
            // Return cached value if available, even if stale
            const cached = localStorage.getItem('downloads-count');
            return cached ? parseInt(cached) : 0;
        } */
    }
});
/* // scripts/footer.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const versionElement = document.getElementById('version-display');
    const downloadsElement = document.getElementById('downloads-display');

    // Fetch version from package.json or config (example)
    const appVersion = window.appConfig?.version || '0.0.1';
    versionElement.textContent = `Version: ${appVersion}`;

    // Simulate/downloads counter (replace with real API call)
    fetchDownloadsCount().then(count => {
        downloadsElement.textContent = `Downloads: ${count.toLocaleString()}`;
    }).catch(() => {
        downloadsElement.textContent = 'Downloads: Offline';
    });

    // Optional: Translation fallback (if you have i18n)
    if (typeof translate === 'function') {
        versionElement.textContent = translate('footer.version', { version: appVersion });
        downloadsElement.textContent = translate('footer.downloads', { count: 'N/A' });
    }
});

// Mock API call (replace with real implementation)
async function fetchDownloadsCount() {
    try {
        const response = await fetch('https://api.your-app.com/downloads');
        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error('Failed to fetch downloads:', error);
        return 0; // Fallback
    }
}

// Export functions to update footer dynamically
window.footer = {
    updateVersion: (newVersion) => {
        document.getElementById('version-display').textContent = `Version: ${newVersion}`;
    },
    updateDownloads: (count) => {
        document.getElementById('downloads-display').textContent = `Downloads: ${count}`;
    }
}; */