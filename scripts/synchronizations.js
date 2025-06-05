// synchronizations.js
class SynchronizationManager {
    constructor() {
        this.initialized = false;
        this.cleanupInterval = null;
    }

    initialize() {
        if (this.initialized) return;
        this.renderSyncSection();
        this.initialized = true;
    }

    renderSyncSection() {
        const periodicTab = document.getElementById('periodic-tab');
        if (!periodicTab) return;

        // Clear any existing content
        periodicTab.innerHTML = '';
        
        // Create container
        const syncContainer = document.createElement('div');
        syncContainer.className = 'settings-synchronization-container';
        periodicTab.appendChild(syncContainer);

        // Build sections
        syncContainer.appendChild(this.createSyncOptionsSection());
        syncContainer.appendChild(this.createCleanupOptionsSection());

        // Setup event listeners
        this.setupEventListeners();
    }

    createSyncOptionsSection() {
        const langData = translations[currentLanguage] || translations['en'];
        const syncOptions = langData.syncOptions || {};

        const section = document.createElement('div');
        section.className = 'settings-synchronization-section';
        section.innerHTML = `
            <div class="settings-synchronization-group">
                <h4 class="settings-synchronization-subtitle">
                    <i class="icon">🔄</i>
                    ${langData.syncOptionsTitle || 'Data Synchronization'}
                </h4>
                <div class="settings-synchronization-option">
                    <label class="settings-synchronization-toggle">
                        <input type="checkbox" id="sync-storage">
                        <span class="settings-synchronization-slider"></span>
                        <span class="settings-synchronization-label">
                            ${syncOptions.storage || 'Sync Storage'}
                            <span class="settings-synchronization-tooltip">
                                ${syncOptions.storageTooltip || 'Keep LocalStorage and IndexedDB in sync'}
                            </span>
                        </span>
                    </label>
                </div>
                <div class="settings-synchronization-option">
                    <label class="settings-synchronization-toggle">
                        <input type="checkbox" id="sync-calendar">
                        <span class="settings-synchronization-slider"></span>
                        <span class="settings-synchronization-label">
                            ${syncOptions.calendar || 'Sync Calendars'}
                            <span class="settings-synchronization-tooltip">
                                ${syncOptions.calendarTooltip || 'Keep Gregorian and Hijri dates synchronized'}
                            </span>
                        </span>
                    </label>
                </div>
            </div>
            <div class="settings-synchronization-group">
                <h4 class="settings-synchronization-subtitle">
                    <i class="icon">🔄</i>
                    ${langData.updateOptionsTitle || 'Update Settings'}
                </h4>
                <div class="settings-synchronization-option">
                    <label class="settings-synchronization-toggle">
                        <input type="checkbox" id="sync-version">
                        <span class="settings-synchronization-slider"></span>
                        <span class="settings-synchronization-label">
                            ${syncOptions.version || 'Auto-updates'}
                            <span class="settings-synchronization-tooltip">
                                ${syncOptions.versionTooltip || 'Automatically install new versions'}
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        `;
        return section;
    }

    createCleanupOptionsSection() {
        const langData = translations[currentLanguage] || translations['en'];

        const section = document.createElement('div');
        section.className = 'settings-synchronization-section';
        section.innerHTML = `
            <div class="settings-synchronization-group">
                <h4 class="settings-synchronization-subtitle">
                    <i class="icon">🧹</i>
                    ${langData.memoryManagement || 'Memory Management'}
                </h4>
                <div class="settings-synchronization-option">
                    <label class="settings-synchronization-toggle">
                        <input type="checkbox" id="auto-clean-toggle">
                        <span class="settings-synchronization-slider"></span>
                        <span class="settings-synchronization-label">
                            ${langData.autoCleanup || 'Automatic Cleanup'}
                            <span class="settings-synchronization-tooltip">
                                ${langData.autoCleanupTooltip || 'Clean old data every 15 days'}
                            </span>
                        </span>
                    </label>
                </div>
                <div class="settings-synchronization-option">
                    <label class="settings-synchronization-toggle">
                        <input type="checkbox" id="emergency-clean-toggle">
                        <span class="settings-synchronization-slider"></span>
                        <span class="settings-synchronization-label">
                            ${langData.emergencyCleanup || 'Emergency Cleanup'}
                            <span class="settings-synchronization-tooltip">
                                ${langData.emergencyCleanupTooltip || 'Clean when storage reaches 90%'}
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        `;
        return section;
    }

    setupEventListeners() {
        // Sync storage toggle
        const syncStorage = document.getElementById('sync-storage');
        if (syncStorage) {
            syncStorage.checked = localStorage.getItem('syncStorage') === 'true';
            syncStorage.addEventListener('change', (e) => {
                localStorage.setItem('syncStorage', e.target.checked);
            });
        }

        // Calendar sync toggle
        const syncCalendar = document.getElementById('sync-calendar');
        if (syncCalendar) {
            syncCalendar.checked = localStorage.getItem('syncCalendars') === 'true';
            syncCalendar.addEventListener('change', (e) => {
                localStorage.setItem('syncCalendars', e.target.checked);
                if (e.target.checked) this.syncCalendarSystems();
            });
        }

        // Auto-update toggle
        const syncVersion = document.getElementById('sync-version');
        if (syncVersion) {
            syncVersion.checked = localStorage.getItem('autoUpdate') === 'true';
            syncVersion.addEventListener('change', (e) => {
                localStorage.setItem('autoUpdate', e.target.checked);
            });
        }

        // Auto-clean toggle
        const autoClean = document.getElementById('auto-clean-toggle');
        if (autoClean) {
            autoClean.checked = localStorage.getItem('autoCleanEnabled') === 'true';
            autoClean.addEventListener('change', (e) => {
                localStorage.setItem('autoCleanEnabled', e.target.checked);
                if (e.target.checked) this.setupPeriodicCleanup();
            });
        }

        // Emergency clean toggle
        const emergencyClean = document.getElementById('emergency-clean-toggle');
        if (emergencyClean) {
            emergencyClean.checked = localStorage.getItem('emergencyCleanEnabled') === 'true';
            emergencyClean.addEventListener('change', (e) => {
                localStorage.setItem('emergencyCleanEnabled', e.target.checked);
            });
        }
    }

    updateLanguageTexts() {
        // Only re-render if periodic tab exists and is visible
        const periodicTab = document.getElementById('periodic-tab');
        if (periodicTab && periodicTab.classList.contains('active')) {
            this.renderSyncSection();
        }
    }



    async performSafeCleanup() {
        if (localStorage.getItem('autoCleanEnabled') !== 'true') {
            console.log('Cleanup aborted - not enabled in settings');
            return;
        }

        const lang = translations[currentLanguage] || translations['en'];
        if (!confirm(lang.confirmCleanup || "Proceed with automatic cleanup?")) {
            console.log('Cleanup canceled by user');
            return;
        }

        const loading = showLoading();
        try {
            // 1. Clear notes older than 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            Object.keys(window.notes).forEach(dateKey => {
                const noteDate = new Date(dateKey);
                if (noteDate < sixMonthsAgo) {
                    delete window.notes[dateKey];
                }
            });

            // 2. Clear old IndexedDB attachments (30+ days old)
            const db = await window.appManager.openDB();
            const tx = db.transaction('attachments', 'readwrite');
            const store = tx.objectStore('attachments');
            const index = store.index('timestamp');
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            
            let cursor = await index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
            while (cursor) {
                await cursor.delete();
                cursor = await cursor.continue();
            }

            saveNotes();
            showToast(lang.storageCleared || 'Storage cleared successfully');
        } catch (error) {
            console.error('Cleanup failed:', error);
            showToast(lang.storageError || 'Error during cleanup');
        } finally {
            hideLoading(loading);
        }
    }

    setupPeriodicCleanup() {
        if (localStorage.getItem('autoCleanEnabled') !== 'true') return;

        // Clear any existing interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Set up new interval (15 days)
        this.cleanupInterval = setInterval(async () => {
            if (navigator.onLine) {
                await this.performSafeCleanup();
                localStorage.setItem('lastCleanup', Date.now());
            }
        }, 15 * 24 * 60 * 60 * 1000);
    }

    syncCalendarSystems() {
        if (localStorage.getItem('syncCalendars') !== 'true') return;
        
        // Actual calendar sync implementation would go here
        console.log("Calendar systems synchronization enabled");
        
        // This would typically:
        // 1. Convert dates between calendar systems
        // 2. Update UI elements
        // 3. Sync with backend if needed
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.synchronizationManager = new SynchronizationManager();
    // Don't initialize here - will be initialized when settings are opened
});