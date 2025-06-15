// synchronizations.js
class SynchronizationManager {
    constructor() {
        // Initialize manager state
        this.initialized = false;
        this.cleanupInterval = null;
    }

    initialize() {
        // Initialize only once
        if (this.initialized) return;
        this.renderSyncSection();
        this.initialized = true;
    }

    renderSyncSection() {
        // Get reference to settings tab
        const periodicTab = document.getElementById('periodic-tab');
        if (!periodicTab) return;

        // Clear existing content
        periodicTab.innerHTML = '';
        
        // Create main container
        const syncContainer = document.createElement('div');
        syncContainer.className = 'settings-synchronization-container';
        periodicTab.appendChild(syncContainer);

        // Build settings sections
        syncContainer.appendChild(this.createSyncOptionsSection());
        syncContainer.appendChild(this.createCleanupOptionsSection());

        // Setup all event handlers
        this.setupEventListeners();
    }

    createSyncOptionsSection() {
        // Load translations with English fallback
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
                                ${syncOptions.calendarTooltip || 'Keep Gregorian and other systems synchronized'}
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
        // Load translations with English fallback
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
        // Handle storage sync toggle
        const syncStorage = document.getElementById('sync-storage');
        if (syncStorage) {
            syncStorage.checked = localStorage.getItem('syncStorage') === 'true';
            syncStorage.addEventListener('change', (e) => {
                localStorage.setItem('syncStorage', e.target.checked);
            });
        }

        // Handle calendar sync toggle
        const syncCalendar = document.getElementById('sync-calendar');
        if (syncCalendar) {
            syncCalendar.checked = localStorage.getItem('syncCalendars') === 'true';
            syncCalendar.addEventListener('change', (e) => {
                localStorage.setItem('syncCalendars', e.target.checked);
                if (e.target.checked) this.syncCalendarSystems();
            });
        }

        // Handle auto-update toggle
        const syncVersion = document.getElementById('sync-version');
        if (syncVersion) {
            syncVersion.checked = localStorage.getItem('autoUpdate') === 'true';
            syncVersion.addEventListener('change', (e) => {
                localStorage.setItem('autoUpdate', e.target.checked);
            });
        }

        // Handle auto-clean toggle
        const autoClean = document.getElementById('auto-clean-toggle');
        if (autoClean) {
            autoClean.checked = localStorage.getItem('autoCleanEnabled') === 'true';
            autoClean.addEventListener('change', (e) => {
                localStorage.setItem('autoCleanEnabled', e.target.checked);
                if (e.target.checked) this.setupPeriodicCleanup();
            });
        }

        // Handle emergency clean toggle
        const emergencyClean = document.getElementById('emergency-clean-toggle');
        if (emergencyClean) {
            emergencyClean.checked = localStorage.getItem('emergencyCleanEnabled') === 'true';
            emergencyClean.addEventListener('change', (e) => {
                localStorage.setItem('emergencyCleanEnabled', e.target.checked);
            });
        }
    }

    updateLanguageTexts() {
        // Only update if settings tab is active
        const periodicTab = document.getElementById('periodic-tab');
        if (periodicTab && periodicTab.classList.contains('active')) {
            this.renderSyncSection();
        }
    }

    async performSafeCleanup() {
        // Check if cleanup is enabled
        if (localStorage.getItem('autoCleanEnabled') !== 'true') {
            console.log('Cleanup aborted - not enabled in settings');
            return;
        }

        // Confirm with user
        const lang = translations[currentLanguage] || translations['en'];
        if (!confirm(lang.confirmCleanup || "Proceed with automatic cleanup?")) {
            console.log('Cleanup canceled by user');
            return;
        }

        const loading = showLoading();
        try {
            // Clean notes older than 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            Object.keys(window.notes).forEach(dateKey => {
                const noteDate = new Date(dateKey);
                if (noteDate < sixMonthsAgo) {
                    delete window.notes[dateKey];
                }
            });

            // Clean old attachments (30+ days)
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
        // Skip if not enabled
        if (localStorage.getItem('autoCleanEnabled') !== 'true') return;

        // Clear existing interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Setup new 15-day interval
        this.cleanupInterval = setInterval(async () => {
            if (navigator.onLine) {
                await this.performSafeCleanup();
                localStorage.setItem('lastCleanup', Date.now());
            }
        }, 15 * 24 * 60 * 60 * 1000);
    }

    syncCalendarSystems() {
        // Skip if not enabled
        if (localStorage.getItem('syncCalendars') !== 'true') return;
        
        console.log("Calendar systems synchronization enabled");
        
        // Implementation would:
        // 1. Convert between calendar systems
        // 2. Update UI elements
        // 3. Sync with backend
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.synchronizationManager = new SynchronizationManager();
});