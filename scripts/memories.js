class MemoryManager {
    constructor() {
        this.eventListeners = [];
        this.initMemoryButtons();
        this.checkStorageWarning();
    }

    /**
     * Initializes all memory-related buttons and their click handlers
     */
    initMemoryButtons() {
        const memoryMonitorBtn = document.getElementById('memory-monitor-btn');
        const clearPartialBtn = document.getElementById('clear-partial-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');

        if (memoryMonitorBtn) {
            this.addListener(memoryMonitorBtn, 'click', () => this.showMemoryMonitor());
        }
        if (clearPartialBtn) {
            this.addListener(clearPartialBtn, 'click', () => this.showPartialClear());
        }
        if (clearAllBtn) {
            this.addListener(clearAllBtn, 'click', () => this.promptClearAll());
        }
    }

    /**
     * Adds an event listener and tracks it for cleanup
     * @param {Element} element - DOM element to add listener to
     * @param {string} event - Event type (e.g. 'click')
     * @param {Function} handler - Event handler function
     */
    addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Removes all tracked event listeners
     */
    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    /**
     * Checks storage usage and warns if approaching limit
     */
    async checkStorageWarning() {
        try {
            if (localStorage.getItem('emergencyCleanEnabled') !== 'true') return;

            const estimate = await navigator.storage.estimate();
            const usagePercentage = (estimate.usage / estimate.quota) * 100;

            if (usagePercentage > 90) {
                const lang = translations[currentLanguage] || translations['en']; // Fallback to English
                if (confirm(lang.storageWarning90 || "Your storage is 90% full. Clean old data?")) {
                    showToast(lang.storageClearing || "Cleaning old data...");
                    await this.performSafeCleanup();
                }
            }
        } catch (error) {
            console.error('Storage check failed:', error);
        }
    }

    /**
     * Shows memory usage overview
     */
    async showMemoryMonitor() {
        try {
            const view = document.getElementById('memory-monitor-view');
            view.innerHTML = this.createLoadingHTML();
            view.classList.remove('hidden');

            const [estimate, notesCount, dbStats] = await Promise.all([
                navigator.storage.estimate(),
                this.countNotes(),
                this.getDBStats()
            ]);

            view.innerHTML = this.createMemoryViewHTML(estimate, notesCount, dbStats);
            view.querySelector('.btn-see-more').addEventListener('click', () => {
                this.showDetailedMemoryView();
            });
        } catch (error) {
            this.showErrorView('memory-monitor-view');
        }
    }

	async showDetailedMemoryView() {
		const view = document.getElementById('memory-monitor-view');
		view.innerHTML = '<div class="loading-spinner"></div>';
		try {
			// Get detailed storage information
			const estimate = await navigator.storage.estimate();
			const notesCount = Object.keys(window.notes || {}).reduce((acc, date) => 
			acc + (window.notes[date]?.length || 0), 0);
			const db = await window.appManager.openDB();
			const attachmentsCount = await this.countObjectStore(db, 'attachments');
			const syncQueueCount = await this.countObjectStore(db, 'SYNC_QUEUE');
			const dbSize = await this.estimateDBSize(db);
			// Format sizes
			const formatBytes = (bytes) => {
				if (bytes === 0) return '0 Bytes';
				const k = 1024;
				const sizes = ['Bytes', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			};
			view.innerHTML = `
            <div class="detailed-memory-view">
			<div class="detail-card">
			<div class="detail-icon">📝</div>
			<div class="detail-content">
			<div class="detail-value">${notesCount}</div>
			<div class="detail-label">Notes</div>
			</div>
			</div>
			<div class="detail-card">
			<div class="detail-icon">📎</div>
			<div class="detail-content">
			<div class="detail-value">${attachmentsCount}</div>
			<div class="detail-label">Attachments</div>
			</div>
			</div>
			<div class="detail-card">
			<div class="detail-icon">🔄</div>
			<div class="detail-content">
			<div class="detail-value">${syncQueueCount}</div>
			<div class="detail-label">Pending Syncs</div>
			</div>
			</div>
			<div class="detail-card">
			<div class="detail-icon">💾</div>
			<div class="detail-content">
			<div class="detail-value">${formatBytes(dbSize)}</div>
			<div class="detail-label">IndexedDB Size</div>
			</div>
			</div>
			<div class="detail-card">
			<div class="detail-icon">📊</div>
			<div class="detail-content">
			<div class="detail-value">${formatBytes(estimate.usage)}</div>
			<div class="detail-label">Storage Used</div>
			</div>
			</div>
			<div class="detail-card">
			<div class="detail-icon">🏷️</div>
			<div class="detail-content">
			<div class="detail-value">${formatBytes(estimate.quota)}</div>
			<div class="detail-label">Total Storage</div>
			</div>
			</div>
			<button class="btn-back" data-tooltip="Return to summary view">
			← Back
			</button>
            </div>
			`;
			view.querySelector('.btn-back').addEventListener('click', () => {
				this.showMemoryMonitor();
			});
			} catch (error) {
			view.innerHTML = `
            <div class="error-message">
			<div class="error-icon">❌</div>
			<div class="error-text">Failed to load detailed memory data</div>
            </div>
			`;
		}
	}
    async countObjectStore(db, storeName) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = (e) => {
                    console.error(`Error counting ${storeName}:`, e.target.error);
                    resolve(0);
				};
				} catch (error) {
                console.error(`Error accessing ${storeName}:`, error);
                resolve(0);
			}
		});
	}
    /**
     * Gets statistics from IndexedDB
     * @returns {Promise<Object>} Database statistics
     */
    async getDBStats() {
        try {
            const db = await window.appManager.openDB();
            const attachments = await this.countObjectStore(db, 'attachments');
            const syncQueue = await this.countObjectStore(db, 'SYNC_QUEUE');
            const size = await this.estimateDBSize(db);
            return { attachments, syncQueue, size };
        } catch (error) {
            console.error('Error getting DB stats:', error);
            return { attachments: 0, syncQueue: 0, size: 0 };
        }
    }

    /**
     * Counts total number of notes across all dates
     * @returns {Promise<number>} Total note count
     */
    async countNotes() {
        try {
            return Object.keys(window.notes || {}).reduce((acc, date) => 
                acc + (window.notes[date]?.length || 0), 0);
        } catch (error) {
            console.error('Error counting notes:', error);
            return 0;
        }
    }

    /**
     * Formats bytes into human-readable string
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Creates loading spinner HTML
     * @returns {string} Loading HTML markup
     */
    createLoadingHTML() {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        return `
            <div class="settings-memories-loading">
                <div class="settings-memories-spinner"></div>
                <p>${lang.loading || 'Loading...'}</p>
            </div>
        `;
    }

    /**
     * Creates error message HTML
     * @param {string} message - Error message to display
     * @returns {string} Error HTML markup
     */
    createErrorHTML(message) {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        return `
            <div class="settings-memories-error">
                <div class="settings-memories-error-icon">❌</div>
                <div class="settings-memories-error-text">
                    ${message || lang.databaseError || 'Error loading data'}
                </div>
            </div>
        `;
    }

    /**
     * Displays error view
     * @param {string} viewId - ID of view element
     * @param {string} message - Error message to display
     */
    showErrorView(viewId, message) {
        const view = document.getElementById(viewId);
        if (view) {
            view.innerHTML = this.createErrorHTML(message);
        }
    }

    /**
     * Creates memory usage visualization HTML
     * @param {Object} estimate - Storage estimate object
     * @param {number} notesCount - Number of notes
     * @param {Object} dbStats - Database statistics
     * @returns {string} Memory view HTML markup
     */
    createMemoryViewHTML(estimate, notesCount, dbStats) {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        const percentage = Math.min(100, (estimate.usage / estimate.quota * 100)).toFixed(0);
        
        return `
            <div class="settings-memories-visualization">
                <div class="settings-memories-circle-container">
                    <div class="settings-memories-circle">
                        <svg viewBox="0 0 36 36">
                            <path class="settings-memories-circle-bg" 
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path class="settings-memories-circle-fill" 
                                  stroke-dasharray="${percentage}, 100" 
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <text x="18" y="20.35" class="settings-memories-percentage">${percentage}%</text>
                        </svg>
                    </div>
                    <div class="settings-memories-circle-label">
                        ${lang.storageUsed || 'Storage Used'}
                    </div>
                </div>
                <div class="settings-memories-legend">
                    <div class="settings-memories-legend-item">
                        <span>${lang.notes || 'Notes'}</span>
                        <span>${notesCount}</span>
                    </div>
                    <div class="settings-memories-legend-item">
                        <span>${lang.attachments || 'Attachments'}</span>
                        <span>${dbStats.attachments}</span>
                    </div>
                    <div class="settings-memories-legend-item">
                        <span>${lang.syncQueue || 'Sync Queue'}</span>
                        <span>${dbStats.syncQueue}</span>
                    </div>
                    <div class="settings-memories-legend-item">
                        <span>${lang.indexedDBSize || 'IndexedDB Size'}</span>
                        <span>${this.formatBytes(dbStats.size)}</span>
                    </div>
                </div>
                <button class="settings-memories-btn btn-see-more">
                    ${lang.seeMore || 'See More'}
                </button>
            </div>
        `;
    }
    /**
     * Shows the partial clear view with options to delete notes by month or attachments
     */
    async showPartialClear() {
        const view = document.getElementById('clear-partial-view');
        view.innerHTML = this.createLoadingHTML();
        view.classList.remove('hidden');
        try {
            const notesByMonth = this.groupNotesByMonth();
            const attachments = await this.getAttachmentsList();
            view.innerHTML = this.createPartialClearViewHTML(notesByMonth, attachments);
            this.setupPartialClearListeners(notesByMonth, attachments);
        } catch (error) {
            console.error('Error showing partial clear:', error);
            this.showErrorView('clear-partial-view');
        }
    }

    /**
     * Groups notes by month for display in the clear interface
     * @returns {Object} Notes grouped by month/year
     */
    groupNotesByMonth() {
        const notesByMonth = {};
        Object.keys(window.notes || {}).forEach(date => {
            const noteDate = new Date(date);
            const monthYear = `${noteDate.getFullYear()}-${noteDate.getMonth()}`;
            if (!notesByMonth[monthYear]) {
                notesByMonth[monthYear] = {
                    count: 0,
                    oldest: date,
                    newest: date,
                    notes: []
                };
            }
            notesByMonth[monthYear].count += window.notes[date].length;
            notesByMonth[monthYear].notes.push(...window.notes[date]);
            if (date < notesByMonth[monthYear].oldest) {
                notesByMonth[monthYear].oldest = date;
            }
            if (date > notesByMonth[monthYear].newest) {
                notesByMonth[monthYear].newest = date;
            }
        });
        return notesByMonth;
    }

    /**
     * Retrieves list of attachments from IndexedDB
     * @returns {Promise<Array>} List of attachments
     */
    async getAttachmentsList() {
        try {
            const db = await window.appManager.openDB();
            const tx = db.transaction('attachments', 'readonly');
            const store = tx.objectStore('attachments');
            return new Promise((resolve) => {
                const attachments = [];
                const request = store.openCursor();
                request.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        attachments.push({
                            id: cursor.value.id,
                            name: cursor.value.name,
                            size: cursor.value.size,
                            date: new Date(cursor.value.timestamp).toISOString().split('T')[0]
                        });
                        cursor.continue();
                    } else {
                        resolve(attachments);
                    }
                };
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            console.error('Error getting attachments:', error);
            return [];
        }
    }

    /**
     * Creates HTML for the partial clear view
     * @param {Object} notesByMonth - Notes grouped by month
     * @param {Array} attachments - List of attachments
     * @returns {string} HTML markup for the view
     */
    createPartialClearViewHTML(notesByMonth, attachments) {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        const months = Object.entries(notesByMonth)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([monthYear, data]) => {
                const [year, month] = monthYear.split('-');
                const monthName = lang.months?.[parseInt(month)] || `Month ${parseInt(month) + 1}`;
                const maxPreview = 3;
                const hasMore = data.notes.length > maxPreview;
                return `
                    <div class="settings-memories-month-card">
                        <div class="settings-memories-month-header">
                            <div class="settings-memories-month-title">
                                <span>📅</span>
                                <span>${monthName} ${year}</span>
                                <span class="settings-memories-note-count">${data.count} ${lang.notes || 'notes'}</span>
                            </div>
                            <button class="settings-memories-btn btn-clear-month" data-month="${monthYear}">
                                🗑️ ${lang.clear || 'Clear'}
                            </button>
                        </div>
                        <div class="settings-memories-month-details">
                            <div class="settings-memories-date-range">
                                <span>📆</span>
                                ${data.oldest} → ${data.newest}
                            </div>
                            <div class="settings-memories-note-preview">
                                ${data.notes.slice(0, maxPreview).map(note => `
                                    <div class="settings-memories-note-item">
                                        <span class="settings-memories-note-type">${noteTypes.find(t => t.type === note.type)?.icon || '📝'}</span>
                                        <span class="settings-memories-note-text">
                                            ${sanitizeHTML(note.text.substring(0, 30))}${note.text.length > 30 ? '...' : ''}
                                        </span>
                                        <button class="settings-memories-delete-btn delete-single-note" 
                                                data-date="${note.date}"
                                                data-index="${data.notes.indexOf(note)}">
                                            ✕
                                        </button>
                                    </div>
                                `).join('')}
                                ${hasMore ? `
                                    <button class="settings-memories-show-all show-all-notes" data-month="${monthYear}">
                                        +${data.count - maxPreview} ${lang.more || 'more'}...
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        const attachmentsSection = attachments.length > 0 ? `
            <div class="settings-memories-clear-section">
                <h4>📎 ${lang.attachments || 'Attachments'}</h4>
                <div class="settings-memories-attachments-list">
                    ${attachments.slice(0, 5).map(attach => `
                        <div class="settings-memories-note-item">
                            <span class="settings-memories-note-type">
                                ${attach.name.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : '📄'}
                            </span>
                            <span class="settings-memories-note-text">
                                ${attach.name} (${Math.round(attach.size / 1024)} KB)
                            </span>
                            <button class="settings-memories-delete-btn delete-attachment" data-id="${attach.id}">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                    ${attachments.length > 5 ? `
                        <div class="settings-memories-show-all">
                            +${attachments.length - 5} ${lang.more || 'more'}...
                        </div>
                    ` : ''}
                    <button class="settings-memories-btn btn-clear-attachments">
                        🗑️ ${lang.clearAllAttachments || 'Clear All Attachments'}
                    </button>
                </div>
            </div>
            ` : '';

        return `
            <div class="settings-memories-clear-options">
                <h3>🗑️ ${lang.clearOptions || 'Clear Options'}</h3>
                <div class="settings-memories-clear-section">
                    <h4>📅 ${lang.notesByMonth || 'Notes by Month'}</h4>
                    <div class="settings-memories-months-list">
                        ${months}
                    </div>
                </div>
                ${attachmentsSection}
            </div>
        `;
    }

    /**
     * Sets up event listeners for the partial clear view
     * @param {Object} notesByMonth - Notes grouped by month
     * @param {Array} attachments - List of attachments
     */
    setupPartialClearListeners(notesByMonth, attachments) {
        document.querySelectorAll('.btn-clear-month').forEach(btn => {
            btn.addEventListener('click', () => this.clearMonth(btn.dataset.month));
        });

        document.querySelectorAll('.delete-single-note').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = translations[currentLanguage] || translations['en']; // Fallback to English
                if (confirm(lang.confirmDeleteSingleNote || "Delete this specific note?")) {
                    await this.deleteSingleNote(btn.dataset.date, parseInt(btn.dataset.index));
                    this.showPartialClear();
                }
            });
        });

        document.querySelectorAll('.show-all-notes').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showAllNotesForMonth(btn.dataset.month);
            });
        });

        if (attachments.length > 0) {
            document.querySelector('.btn-clear-attachments').addEventListener('click', () => {
                this.promptClearAttachments(attachments.length);
            });

            document.querySelectorAll('.delete-attachment').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.deleteSingleAttachment(btn.dataset.id);
                    this.showPartialClear();
                });
            });
        }
    }

    /**
     * Shows all notes for a specific month
     * @param {string} monthYear - Month/year in format "YYYY-M"
     */
    async showAllNotesForMonth(monthYear) {
        const view = document.getElementById('clear-partial-view');
        view.innerHTML = this.createLoadingHTML();
        try {
            const [year, month] = monthYear.split('-').map(Number);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            const notesForMonth = Object.entries(window.notes || {})
                .filter(([dateKey]) => {
                    const noteDate = new Date(dateKey);
                    return noteDate >= monthStart && noteDate <= monthEnd;
                })
                .flatMap(([dateKey, notes]) => notes.map(note => ({ ...note, dateKey })));
            view.innerHTML = this.createAllNotesViewHTML(monthYear, notesForMonth);
            this.setupAllNotesListeners(monthYear);
        } catch (error) {
            console.error('Error showing all notes:', error);
            this.showErrorView('clear-partial-view');
        }
    }

    /**
     * Creates HTML for viewing all notes in a month
     * @param {string} monthYear - Month/year in format "YYYY-M"
     * @param {Array} notes - Array of notes for the month
     * @returns {string} HTML markup for the view
     */
    createAllNotesViewHTML(monthYear, notes) {
        const [year, month] = monthYear.split('-').map(Number);
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        const monthName = lang.months?.[month] || `Month ${month + 1}`;
        
        return `
            <div class="settings-memories-all-notes-view">
                <h3>${lang.allNotesFor || 'All notes for'} ${monthName} ${year}</h3>
                <div class="settings-memories-notes-container">
                    ${notes.map(note => `
                        <div class="settings-memories-note-item">
                            <div class="settings-memories-note-header">
                                <span class="settings-memories-note-date">${note.dateKey}</span>
                                <span class="settings-memories-note-type">
                                    ${noteTypes.find(t => t.type === note.type)?.icon || '📝'}
                                </span>
                            </div>
                            <div class="settings-memories-note-content">
                                ${note.time ? `<div class="settings-memories-note-time">⏰ ${note.time}</div>` : ''}
                                <div class="settings-memories-note-text">${sanitizeHTML(note.text)}</div>
                            </div>
                            <button class="settings-memories-delete-btn delete-single-note" 
                                    data-date="${note.dateKey}"
                                    data-index="${window.notes[note.dateKey].indexOf(note)}">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="settings-memories-btn btn-back">
                    ← ${lang.back || 'Back'}
                </button>
            </div>
        `;
    }

    /**
     * Sets up event listeners for the all notes view
     * @param {string} monthYear - Month/year in format "YYYY-M"
     */
    setupAllNotesListeners(monthYear) {
        document.querySelector('.btn-back').addEventListener('click', () => {
            this.showPartialClear();
        });

        document.querySelectorAll('.delete-single-note').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = translations[currentLanguage] || translations['en']; // Fallback to English
                if (confirm(lang.confirmDeleteSingleNote || "Delete this specific note?")) {
                    await this.deleteSingleNote(btn.dataset.date, parseInt(btn.dataset.index));
                    this.showAllNotesForMonth(monthYear);
                }
            });
        });
    }

    /**
     * Prompts user to confirm clearing all attachments
     * @param {number} count - Number of attachments to be deleted
     */
    promptClearAttachments(count) {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        const message = lang.confirmClearAttachments?.replace('{count}', count) || 
                       `Are you sure you want to delete all ${count} attachments?`;
        if (confirm(message)) {
            this.clearAllAttachments();
        }
    }
    /**
     * Deletes a single note by date and index
     * @param {string} dateKey - Date key in format "YYYY-MM-DD"
     * @param {number} index - Index of note in the date's array
     * @returns {Promise<boolean>} True if deletion was successful
     */
    async deleteSingleNote(dateKey, index) {
        try {
            if (window.notes[dateKey] && window.notes[dateKey].length > index) {
                window.notes[dateKey].splice(index, 1);
                if (window.notes[dateKey].length === 0) {
                    delete window.notes[dateKey];
                }
                await saveNotes();
                const lang = translations[currentLanguage] || translations['en']; // Fallback to English
                showToast(lang.noteDeleted || 'Note deleted');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting note:', error);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.deleteError || 'Error deleting note');
            return false;
        }
    }

    /**
     * Deletes a single attachment by ID
     * @param {string} id - Attachment ID
     * @returns {Promise<boolean>} True if deletion was successful
     */
    async deleteSingleAttachment(id) {
        try {
            const db = await window.appManager.openDB();
            const tx = db.transaction('attachments', 'readwrite');
            await tx.objectStore('attachments').delete(id);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.attachmentDeleted || 'Attachment deleted');
            return true;
        } catch (error) {
            console.error('Error deleting attachment:', error);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.deleteError || 'Error deleting attachment');
            return false;
        }
    }

    /**
     * Clears all attachments from IndexedDB
     * @returns {Promise<boolean>} True if operation was successful
     */
    async clearAllAttachments() {
        const loading = showLoading();
        try {
            const db = await window.appManager.openDB();
            await this.clearObjectStore(db, 'attachments');
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.attachmentsCleared || 'All attachments cleared');
            this.showPartialClear();
            return true;
        } catch (error) {
            console.error('Error clearing attachments:', error);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.clearError || 'Error clearing attachments');
            return false;
        } finally {
            hideLoading(loading);
        }
    }

    /**
     * Clears an entire IndexedDB object store
     * @param {IDBDatabase} db - IndexedDB database instance
     * @param {string} storeName - Name of the object store to clear
     * @returns {Promise<void>}
     */
    async clearObjectStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Clears all notes for a specific month
     * @param {string} monthYear - Month/year in format "YYYY-M"
     * @returns {Promise<boolean>} True if operation was successful
     */
    async clearMonth(monthYear) {
        const loading = showLoading();
        try {
            const [year, month] = monthYear.split('-').map(Number);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            Object.keys(window.notes || {}).forEach(dateKey => {
                const noteDate = new Date(dateKey);
                if (noteDate >= monthStart && noteDate <= monthEnd) {
                    delete window.notes[dateKey];
                }
            });
            await saveNotes();
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.monthCleared || 'Month data cleared');
            this.showPartialClear();
            return true;
        } catch (error) {
            console.error('Error clearing month:', error);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.clearError || 'Error clearing data');
            return false;
        } finally {
            hideLoading(loading);
        }
    }

    /**
     * Shows confirmation modal for clearing all data
     */
    promptClearAll() {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        const modal = document.createElement('div');
        modal.className = 'settings-memories-confirm-modal';
        modal.innerHTML = `
            <div class="settings-memories-confirm-content">
                <h3>
                    <span class="settings-memories-warning-icon">⚠️</span>
                    ${lang.clearAllWarning || 'WARNING: Data Deletion'}
                </h3>
                <div class="settings-memories-clear-options">
                    <label class="settings-memories-option-item">
                        <input type="checkbox" id="clear-notes" checked>
                        <span class="settings-memories-checkmark"></span>
                        <span class="settings-memories-option-label">
                            📝 ${lang.clearAllNotes || 'All notes'}
                        </span>
                    </label>
                    <label class="settings-memories-option-item">
                        <input type="checkbox" id="clear-attachments" checked>
                        <span class="settings-memories-checkmark"></span>
                        <span class="settings-memories-option-label">
                            📎 ${lang.clearAllAttachments || 'All attachments'}
                        </span>
                    </label>
                    <label class="settings-memories-option-item">
                        <input type="checkbox" id="clear-sync" checked>
                        <span class="settings-memories-checkmark"></span>
                        <span class="settings-memories-option-label">
                            🔄 ${lang.clearAllSync || 'Sync queue'}
                        </span>
                    </label>
                    <label class="settings-memories-option-item">
                        <input type="checkbox" id="clear-localstorage">
                        <span class="settings-memories-checkmark"></span>
                        <span class="settings-memories-option-label">
                            💾 ${lang.clearAllLocalStorage || 'LocalStorage data'}
                            <span class="settings-memories-warning-badge">!</span>
                        </span>
                    </label>
                </div>
                <div class="settings-memories-warning-message">
                    <span class="settings-memories-warning-icon">⚠️</span>
                    <p>${lang.clearAllWarningText || 'This action cannot be undone. Make sure to export important data first.'}</p>
                </div>
                <div class="settings-memories-confirm-buttons">
                    <button class="settings-memories-cancel-btn">
                        ${lang.cancel || 'Cancel'}
                    </button>
                    <button class="settings-memories-confirm-btn">
                        ${lang.clearConfirm || 'Clear Selected Data'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.settings-memories-cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
        modal.querySelector('.settings-memories-confirm-btn').addEventListener('click', async () => {
            const clearNotes = modal.querySelector('#clear-notes').checked;
            const clearAttachments = modal.querySelector('#clear-attachments').checked;
            const clearSync = modal.querySelector('#clear-sync').checked;
            const clearLocalStorage = modal.querySelector('#clear-localstorage').checked;
            await this.executeClearAll(clearNotes, clearAttachments, clearSync, clearLocalStorage);
            modal.remove();
        });
    }

    /**
     * Executes the full data clearing operation based on user selection
     * @param {boolean} clearNotes - Whether to clear notes
     * @param {boolean} clearAttachments - Whether to clear attachments
     * @param {boolean} clearSync - Whether to clear sync queue
     * @param {boolean} clearLocalStorage - Whether to clear localStorage
     * @returns {Promise<boolean>} True if operation was successful
     */
    async executeClearAll(clearNotes, clearAttachments, clearSync, clearLocalStorage) {
        const loading = showLoading();
        try {
            // Clear notes
            if (clearNotes) {
                window.notes = {};
                await saveNotes();
            }
            // Clear IndexedDB
            if (clearAttachments || clearSync) {
                const db = await window.appManager.openDB();
                if (clearAttachments) await this.clearObjectStore(db, 'attachments');
                if (clearSync) await this.clearObjectStore(db, 'SYNC_QUEUE');
            }
            // Clear localStorage (but preserve language and calendar prefs)
            if (clearLocalStorage) {
                const langPref = localStorage.getItem('selectedLanguage');
                const calendarPref = localStorage.getItem('calendarSystem');
                localStorage.clear();
                if (langPref) localStorage.setItem('selectedLanguage', langPref);
                if (calendarPref) localStorage.setItem('calendarSystem', calendarPref);
            }
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.clearCompleted || 'Data cleared successfully');
            this.closeSettings();
            return true;
        } catch (error) {
            console.error('Clear all error:', error);
            const lang = translations[currentLanguage] || translations['en']; // Fallback to English
            showToast(lang.clearError || 'Error clearing data');
            return false;
        } finally {
            hideLoading(loading);
        }
    }
    closeSettings() {
        // Remove direct modal reference and use querySelector instead
        const modal = document.getElementById('settings-modal');
        if (modal) modal.style.display = 'none';
        
        // Hide any open sub-views
        document.getElementById('memory-monitor-view').classList.add('hidden');
        document.getElementById('clear-partial-view').classList.add('hidden');
    }

    /**
     * Estimates the total size of IndexedDB data
     * @param {IDBDatabase} db - IndexedDB database instance
     * @returns {Promise<number>} Estimated size in bytes
     */
    async estimateDBSize(db) {
        return new Promise((resolve) => {
            let size = 0;
            const stores = ['attachments', 'SYNC_QUEUE'];
            let storesProcessed = 0;
            stores.forEach(storeName => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.openCursor();
                request.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (storeName === 'attachments' && cursor.value?.file) {
                            size += cursor.value.file.size || 0;
                        } else {
                            size += JSON.stringify(cursor.value).length;
                        }
                        cursor.continue();
                    } else {
                        storesProcessed++;
                        if (storesProcessed === stores.length) {
                            resolve(size);
                        }
                    }
                };
                request.onerror = () => {
                    storesProcessed++;
                    if (storesProcessed === stores.length) {
                        resolve(size);
                    }
                };
            });
        });
    }

    /**
     * Performs automatic cleanup of old data
     * @returns {Promise<boolean>} True if cleanup was successful
     */
    async performSafeCleanup() {
        if (localStorage.getItem('autoCleanEnabled') !== 'true') {
            console.log('Cleanup aborted - not enabled in settings');
            return false;
        }
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        if (!confirm(lang.confirmCleanup || "Proceed with automatic cleanup?")) {
            console.log('Cleanup canceled by user');
            return false;
        }
        const loading = showLoading();
        try {
            // 1. Clear notes older than 30 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            Object.keys(window.notes || {}).forEach(date => {
                if (new Date(date) < cutoffDate) {
                    delete window.notes[date];
                }
            });
            await saveNotes();
            // 2. Clear old attachments and sync queue
            const db = await window.appManager.openDB();
            const tx = db.transaction(['attachments', 'SYNC_QUEUE'], 'readwrite');
            // Delete attachments older than cutoff
            const attachmentsStore = tx.objectStore('attachments');
            const attachmentsRequest = attachmentsStore.index('timestamp')
                .openCursor(IDBKeyRange.upperBound(cutoffDate.getTime()));
            attachmentsRequest.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            // Clear sync queue
            await tx.objectStore('SYNC_QUEUE').clear();
            await tx.complete;
            showToast(lang.storageCleared || 'Old data cleared successfully');
            return true;
        } catch (error) {
            console.error('Cleanup error:', error);
            showToast(lang.cleanupError || 'Error during cleanup');
            return false;
        } finally {
            hideLoading(loading);
        }
    }

    /**
     * Updates all UI texts when language changes
     */
    updateLanguageTexts() {
        const lang = translations[currentLanguage] || translations['en']; // Fallback to English
        
        // Update tab button text
        const tabButton = document.querySelector('[data-tab="memory"]');
        if (tabButton) tabButton.textContent = lang.memory || 'Memory';

        // Update buttons
        const buttons = document.querySelectorAll('#memory-tab button');
        if (buttons.length >= 3) {
            buttons[0].textContent = lang.memoryMonitor || 'Memory Monitor';
            buttons[1].textContent = lang.clearPartial || 'Clear Partial Data';
            buttons[2].textContent = lang.clearAll || 'Clear All Data';
        }

        // Refresh any visible views
        if (!document.getElementById('memory-monitor-view').classList.contains('hidden')) {
            this.showMemoryMonitor();
        }
        if (!document.getElementById('clear-partial-view').classList.contains('hidden')) {
            this.showPartialClear();
        }
    }
}

// Initialize memory manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
// Initialize only if not already initialized
if (!window.memoryManager) {
    window.memoryManager = new MemoryManager();
}
});