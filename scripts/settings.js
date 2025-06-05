// settings.js
class SettingsManager {
    constructor() {
        this.modal = document.getElementById('settings-modal');
        this.initSettingsButton();
        this.initModal();
    }
    initSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
		}
	}
    initModal() {
		// Close modal when clicking X
		this.modal.querySelector('.close-modal').addEventListener('click', () => this.closeSettings());
		// Close when clicking outside modal
		this.modal.addEventListener('click', (e) => {
			if (e.target === this.modal) this.closeSettings();
		});
		// Tab switching 
		document.querySelectorAll('.settings-tab-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				// Hide all sub-views when switching tabs
				document.querySelectorAll('[id$="-view"]').forEach(view => {
					view.classList.add('hidden');
				});
				// Remove active class from all buttons
				document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
				// Remove active class from all content
				document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
				// Add active class to clicked button
				btn.classList.add('active');
				// Show corresponding content
				const tabId = btn.dataset.tab + '-tab';
				document.getElementById(tabId).classList.add('active');
				// Hide any open sub-views when switching tabs
				document.getElementById('memory-monitor-view').classList.add('hidden');
				document.getElementById('clear-partial-view').classList.add('hidden');
			});
		});
    
    // Language select listener
    const langSelectSettings = this.modal.querySelector('#language-select-settings');
    if (langSelectSettings) {
        langSelectSettings.value = window.currentLanguage;
        langSelectSettings.addEventListener('change', function() {
            window.currentLanguage = this.value;
            localStorage.setItem('selectedLanguage', window.currentLanguage);
            renderCalendar(translations[window.currentLanguage]);
            window.settingsManager.updateLanguageTexts();
        });
    }

    // Calendar system select listener
    const calendarSelectSettings = this.modal.querySelector('#calendar-system-settings');
    if (calendarSelectSettings) {
        calendarSelectSettings.value = window.currentCalendarSystem;
        calendarSelectSettings.addEventListener('change', function() {
            window.currentCalendarSystem = this.value;
            localStorage.setItem('calendarSystem', window.currentCalendarSystem);
            renderCalendar(translations[window.currentLanguage]);
        });
    }
		// Add notification toggle listeners
		document.querySelectorAll('.settings-notifications-checkbox').forEach((checkbox, index) => {
			checkbox.addEventListener('change', (e) => {
				const key = index === 0 ? 'notifyUpdates' : 'notifyDaily';
				localStorage.setItem(key, e.target.checked);
				console.log(`${key} set to ${e.target.checked}`);
				// Restart notifications if needed
				if (index === 1 && e.target.checked) {
					window.notificationManager.scheduleDailyNotifications();
				}
			});
		});
    // Add notification time listener
const timeInput = document.querySelector('.settings-notifications-time');
if (timeInput) {
    // Initialize from localStorage
    const savedTime = localStorage.getItem('notificationTime') || '09:00';
    timeInput.value = savedTime;
    
    timeInput.addEventListener('change', (e) => {
        localStorage.setItem('notificationTime', e.target.value);
    });
}

// Add notification sound listener
const soundSelect = document.querySelector('.settings-notifications-select');
if (soundSelect) {
    // Initialize from localStorage
    const savedSound = localStorage.getItem('notificationSound') || 'default';
    soundSelect.value = savedSound;
    
    soundSelect.addEventListener('change', (e) => {
        localStorage.setItem('notificationSound', e.target.value);
    });
}
		// Add test button listener
		document.querySelector('.settings-notifications-test-btn').addEventListener('click', () => {
			window.notificationManager.showTestNotification();
		});
		// Memory management buttons
		document.getElementById('memory-monitor-btn').addEventListener('click', () => this.showMemoryMonitor());
		document.getElementById('clear-partial-btn').addEventListener('click', () => this.showPartialClear());
		document.getElementById('clear-all-btn').addEventListener('click', () => this.promptClearAll());
	}
    
    openSettings() {
    this.modal.style.display = 'block';
    this.updateLanguageTexts();
    
    // Refresh notification toggle states
    const checkboxes = this.modal.querySelectorAll('.settings-notifications-checkbox');
    if (checkboxes.length >= 2) {
        checkboxes[0].checked = localStorage.getItem('notifyUpdates') === 'true';
        checkboxes[1].checked = localStorage.getItem('notifyDaily') === 'true';
    }
    
    // Refresh time and sound settings
    const timeInput = this.modal.querySelector('.settings-notifications-time');
    const soundSelect = this.modal.querySelector('.settings-notifications-select');
    if (timeInput) timeInput.value = localStorage.getItem('notificationTime') || '09:00';
    if (soundSelect) soundSelect.value = localStorage.getItem('notificationSound') || 'default';
    
    // Initialize synchronization manager if not already done
    if (window.synchronizationManager && !window.synchronizationManager.initialized) {
        window.synchronizationManager.initialize();
    }
}
    closeSettings() {
        this.modal.style.display = 'none';
        // Hide any open sub-views
        document.getElementById('memory-monitor-view').classList.add('hidden');
        document.getElementById('clear-partial-view').classList.add('hidden');
	}
    
    updateLanguageTexts() {
    const lang = translations[currentLanguage];
    this.modal.querySelector('#settings-title').textContent = lang.title || 'Settings';
    
    // Language tab
    document.querySelector('[data-tab="language"]').textContent = lang.language || 'Language';
    document.querySelector('#language-tab h3').textContent = lang.languageSettings || 'Language Settings';
    document.querySelector('.language-text').textContent = lang.applicationLanguage || 'Application Language';
    
    // Calendar tab
    document.querySelector('[data-tab="calendar"]').textContent = lang.calendar || 'Calendar';
    document.querySelector('#calendar-tab h3').textContent = lang.calendarSettings || 'Calendar Settings';
    document.querySelector('.calendar-text').textContent = lang.calendarSystem || 'Calendar System';
    
    // Update language select options
    const langSelect = this.modal.querySelector('#language-select-settings');
    if (langSelect) {
        Array.from(langSelect.options).forEach(option => {
            if (option.value === 'en') option.text = lang.english || 'English';
            if (option.value === 'ar') option.text = lang.arabic || 'العربية (Arabic)';
            if (option.value === 'fr') option.text = lang.french || 'Français (French)';
        });
        langSelect.value = window.currentLanguage;
    }
    // Preserve notification settings when language changes
    const timeInput = document.querySelector('.settings-notifications-time');
    const soundSelect = document.querySelector('.settings-notifications-select');
    const savedTime = timeInput ? timeInput.value : '09:00';
    const savedSound = soundSelect ? soundSelect.value : 'default';
        
        // Memory tab
        document.querySelector('[data-tab="memory"]').textContent = lang.memory || 'Memory';
        document.getElementById('memory-monitor-btn').textContent = lang.memoryMonitor || 'Memory Monitor';
        document.getElementById('clear-partial-btn').textContent = lang.clearPartial || 'Clear Partial Data';
        document.getElementById('clear-all-btn').textContent = lang.clearAll || 'Clear All Data';
        
        // Periodic Activities tab
        document.querySelector('[data-tab="periodic"]').textContent = lang.periodicActivities || 'Periodic Activities';
        
        // Notifications tab
        document.querySelector('[data-tab="notifications"]').textContent = lang.notificationSettings || 'Notifications';
        document.querySelector('.settings-notifications-title').textContent = lang.notificationSettings || 'Notification Settings';
        document.querySelectorAll('.settings-notifications-label .notification-text')[0].textContent = lang.enableUpdateReminders || 'Enable updates reminders';
        document.querySelectorAll('.settings-notifications-tooltip')[0].textContent = lang.updateRemindersTooltip || 'Get reminders when updates are available';
        document.querySelectorAll('.settings-notifications-label .notification-text')[1].textContent = lang.enableDailyNotifications || 'Enable daily notifications';
        document.querySelectorAll('.settings-notifications-tooltip')[1].textContent = lang.dailyNotificationsTooltip || 'Receive daily summary notifications';
        document.querySelectorAll('.settings-notifications-label .notification-text')[2].textContent = lang.notificationSound || 'Notification sound';
        document.querySelectorAll('.settings-notifications-label .notification-text')[3].textContent = lang.notificationTime || 'Notification time';
    // Restore values after language update
    if (timeInput) timeInput.value = savedTime;
    if (soundSelect) soundSelect.value = savedSound;
        
        // Close button
        this.modal.querySelector('.close-modal').textContent = lang.close || '×';
        
        // Sync options (if they exist)
        if (document.querySelector('.settings-sync-options-section h3')) {
            document.querySelector('.settings-sync-options-section h3').textContent = lang.synchronization || 'Synchronization';
        }
        
        // Memory visualization
        if (document.querySelector('.circle-label')) {
            document.querySelector('.circle-label').textContent = lang.storageUsed || 'Storage Used';
        }
        
        // Update synchronization section
        if (window.synchronizationManager) {
            window.synchronizationManager.updateLanguageTexts();
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
    async showMemoryMonitor() {
		const view = document.getElementById('memory-monitor-view');
		view.innerHTML = `
        <div class="loading-container">
		<div class="loading-spinner"></div>
		<p>${translations[currentLanguage].loading || 'Loading memory data...'}</p>
        </div>
		`;
		view.classList.remove('hidden');
		try {
			// Get storage estimates
			const estimate = await navigator.storage.estimate();
			const notesCount = Object.keys(window.notes || {}).reduce((acc, date) => 
			acc + (window.notes[date]?.length || 0), 0);
			// Get IndexedDB stats
			let dbStats = { attachments: 0, syncQueue: 0, size: 0 };
			try {
				const db = await window.appManager.openDB();
				dbStats.attachments = await this.countObjectStore(db, 'attachments');
				dbStats.syncQueue = await this.countObjectStore(db, 'SYNC_QUEUE');
				dbStats.size = await this.estimateDBSize(db);
				} catch (e) {
				console.error('Error accessing IndexedDB:', e);
			}
			// Format sizes
			const formatBytes = (bytes) => {
				if (bytes === 0) return '0 Bytes';
				const k = 1024;
				const sizes = ['Bytes', 'KB', 'MB', 'GB'];
				const i = Math.floor(Math.log(bytes) / Math.log(k));
				return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
			};
			view.innerHTML = `
            <div class="memory-visualization">
			<div class="storage-circle-container">
			<div class="storage-circle">
			<svg viewBox="0 0 36 36">
			<path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
			<path class="circle-fill" stroke-dasharray="${(estimate.usage / estimate.quota * 100).toFixed(0)}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
			<text x="18" y="20.35" class="percentage">${(estimate.usage / estimate.quota * 100).toFixed(0)}%</text>
			</svg>
			</div>
			<div class="circle-label">Storage Used</div>
			</div>
			<div class="storage-legend">
			<div class="legend-item">
			<span>Notes</span>
			<span>${notesCount}</span>
			</div>
			<div class="legend-item">
			<span>Attachments</span>
			<span>${dbStats.attachments}</span>
			</div>
			<div class="legend-item">
			<span>Sync Queue</span>
			<span>${dbStats.syncQueue}</span>
			</div>
			<div class="legend-item">
			<span>IndexedDB Size</span>
			<span>${formatBytes(dbStats.size)}</span>
			</div>
			</div>
			<button class="btn-see-more">${translations[currentLanguage].seeMore || 'See More'}</button>
            </div>
			`;
			// Style the "See More" button properly
			view.querySelector('.btn-see-more').addEventListener('click', () => {
				this.showDetailedMemoryView();
			});
			} catch (error) {
			view.innerHTML = `
            <div class="error-message">
			<div class="error-icon">❌</div>
			<div class="error-text">${translations[currentLanguage].databaseError || 'Error loading memory data'}</div>
            </div>
			`;
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
    async showPartialClear() {
        const view = document.getElementById('clear-partial-view');
        view.innerHTML = '<div class="loading-spinners"></div>';
        view.classList.remove('hidden');
        try {
            // Group notes by month and collect attachments
            const notesByMonth = {};
            const attachments = [];
            // Get attachments from IndexedDB
            const db = await window.appManager.openDB();
            const tx = db.transaction('attachments', 'readonly');
            const store = tx.objectStore('attachments');
            const cursorRequest = store.openCursor();
            cursorRequest.onsuccess = (e) => {
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
                    // Process after cursor completes
                    this.renderPartialClearView(view, notesByMonth, attachments);
				}
			};
            cursorRequest.onerror = () => {
                this.renderPartialClearView(view, notesByMonth, []);
			};
            // Process notes
            Object.keys(window.notes).forEach(date => {
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
                if (date < notesByMonth[monthYear].oldest) notesByMonth[monthYear].oldest = date;
                if (date > notesByMonth[monthYear].newest) notesByMonth[monthYear].newest = date;
			});
			} catch (error) {
            view.innerHTML = `
			<div class="error-message">
			<i class="icon">❌</i>
			<p>${translations[currentLanguage].databaseError || 'Error loading data'}</p>
			</div>
            `;
		}
	}
    renderPartialClearView(view, notesByMonth, attachments) {
		view.innerHTML = `
        <div class="clear-options">
		<h3><i class="icon">🗑️</i> ${translations[currentLanguage].clearOptions || 'Clear Options'}</h3>
		<div class="clear-section">
		<h4><i class="icon">📅</i> ${translations[currentLanguage].notesByMonth || 'Notes by Month'}</h4>
		<div class="months-list">
		${Object.entries(notesByMonth)
		.sort((a, b) => b[0].localeCompare(a[0]))
		.map(([monthYear, data]) => {
		const [year, month] = monthYear.split('-');
		const monthName = translations[currentLanguage].months[parseInt(month)];
		const maxPreview = 3;
		const hasMore = data.notes.length > maxPreview;
		return `
		<div class="month-card">
		<div class="month-header">
		<div class="month-title">
		<i class="icon">📅</i>
		<span>${monthName} ${year}</span>
		<span class="note-count">${data.count} notes</span>
		</div>
		<button class="btn-clear-month" 
		data-month="${monthYear}"
		data-tooltip="Clear all notes for ${monthName} ${year}">
		<i class="icon">🗑️</i> ${translations[currentLanguage].clear || 'Clear'}
		</button>
		</div>
		<div class="month-details">
		<div class="date-range">
		<i class="icon">📆</i>
		${data.oldest} → ${data.newest}
		</div>
		<div class="notes-preview">
		${data.notes.slice(0, maxPreview).map(note => `
			<div class="note-preview" 
			style="border-left: 3px solid ${noteColors.find(c => c.class === note.color)?.color || '#ccc'}">
			<span class="note-type-icon">${noteTypes.find(t => t.type === note.type)?.icon || '📝'}</span>
			<span class="note-text">${sanitizeHTML(note.text.substring(0, 30))}${note.text.length > 30 ? '...' : ''}</span>
			<button class="delete-single-note" 
			data-date="${note.date}"
			data-index="${data.notes.indexOf(note)}"
			data-tooltip="Delete this specific note">
			✕
			</button>
			</div>
		`).join('')}
		${hasMore ? `
			<button class="show-all-notes" 
			data-month="${monthYear}"
			data-tooltip="Show all ${data.count} notes">
			+${data.count - maxPreview} more...
			</button>
		` : ''}
		</div>
		</div>
		</div>
		`;
		}).join('')
		}
		</div>
		</div>
		<!-- Attachments section remains the same -->
		${attachments.length > 0 ? `
		<div class="clear-section">
		<h4><i class="icon">📎</i> ${translations[currentLanguage].attachments || 'Attachments'}</h4>
		<div class="attachments-list">
		${attachments.slice(0, 5).map(attach => `
			<div class="attachment-item">
			<span class="attach-icon">${attach.name.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : '📄'}</span>
			<span class="attach-name">${attach.name}</span>
			<span class="attach-size">${Math.round(attach.size / 1024)} KB</span>
			<span class="attach-date">${attach.date}</span>
			<button class="delete-attachment" 
			data-id="${attach.id}"
			data-tooltip="Delete this attachment">
			✕
			</button>
			</div>
		`).join('')}
		${attachments.length > 5 ? `
			<div class="more-attachments">
			+${attachments.length - 5} more attachments
			</div>
		` : ''}
		<button class="btn-clear-attachments">
		<i class="icon">🗑️</i> ${translations[currentLanguage].clearAllAttachments || 'Clear All Attachments'}
		</button>
		</div>
		</div>
		` : ''}
        </div>
		`;
		// Add event listeners
		document.querySelectorAll('.btn-clear-month').forEach(btn => {
			btn.addEventListener('click', () => this.clearMonth(btn.dataset.month));
		});
		document.querySelectorAll('.delete-single-note').forEach(btn => {
			btn.addEventListener('click', async (e) => {
				e.stopPropagation();
				const date = btn.dataset.date;
				const index = parseInt(btn.dataset.index);
				if (confirm(translations[currentLanguage].confirmDeleteSingleNote || "Delete this specific note?")) {
					await this.deleteSingleNote(date, index);
					this.showPartialClear(); // Refresh view
				}
			});
		});
		document.querySelectorAll('.show-all-notes').forEach(btn => {
			btn.addEventListener('click', () => {
				const monthYear = btn.dataset.month;
				this.showAllNotesForMonth(monthYear);
			});
		});
		if (attachments.length > 0) {
			document.querySelector('.btn-clear-attachments').addEventListener('click', () => {
				this.promptClearAttachments(attachments.length);
			});
			document.querySelectorAll('.delete-attachment').forEach(btn => {
				btn.addEventListener('click', async (e) => {
					e.stopPropagation();
					const id = btn.dataset.id;
					await this.deleteSingleAttachment(id);
					this.showPartialClear(); // Refresh view
				});
			});
		}
	}
    promptClearAttachments(count) {
        if (confirm(`${translations[currentLanguage].confirmClearAttachments || 'Are you sure you want to delete all'} ${count} ${translations[currentLanguage].attachments || 'attachments'}?`)) {
            this.clearAllAttachments();
		}
	}
	async deleteSingleNote(dateKey, index) {
		try {
			if (window.notes[dateKey] && window.notes[dateKey].length > index) {
				window.notes[dateKey].splice(index, 1);
				if (window.notes[dateKey].length === 0) {
					delete window.notes[dateKey];
				}
				await saveNotes();
				showToast(translations[currentLanguage].noteDeleted || 'Note deleted');
			}
			} catch (error) {
			console.error('Error deleting note:', error);
			showToast(translations[currentLanguage].deleteError || 'Error deleting note');
		}
	}
	async deleteSingleAttachment(id) {
		try {
			const db = await this.openDB();
			const tx = db.transaction('attachments', 'readwrite');
			await tx.objectStore('attachments').delete(id);
			showToast(translations[currentLanguage].attachmentDeleted || 'Attachment deleted');
			} catch (error) {
			console.error('Error deleting attachment:', error);
			showToast(translations[currentLanguage].deleteError || 'Error deleting attachment');
		}
	}
	showAllNotesForMonth(monthYear) {
		const [year, month] = monthYear.split('-').map(Number);
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0);
		const notesForMonth = Object.entries(window.notes)
        .filter(([dateKey]) => {
            const noteDate = new Date(dateKey);
            return noteDate >= monthStart && noteDate <= monthEnd;
		})
        .flatMap(([dateKey, notes]) => notes.map(note => ({ ...note, dateKey })));
		const view = document.getElementById('clear-partial-view');
		view.innerHTML = `
        <div class="all-notes-view">
		<h3>All notes for ${translations[currentLanguage].months[month]} ${year}</h3>
		<button class="btn-back" data-tooltip="Return to monthly view">
		← Back
		</button>
		<div class="notes-container">
		${notesForMonth.map(note => `
		<div class="full-note-item" 
		style="border-left: 3px solid ${noteColors.find(c => c.class === note.color)?.color || '#ccc'}">
		<div class="note-header">
		<span class="note-date">${note.dateKey}</span>
		<span class="note-type-icon">${noteTypes.find(t => t.type === note.type)?.icon || '📝'}</span>
		</div>
		<div class="note-content">
		${note.time ? `<div class="note-time">${note.time}</div>` : ''}
		<div class="note-text">${sanitizeHTML(note.text)}</div>
		</div>
		<button class="delete-single-note" 
		data-date="${note.dateKey}"
		data-index="${window.notes[note.dateKey].indexOf(note)}"
		data-tooltip="Delete this note">
		✕
		</button>
		</div>
		`).join('')}
		</div>
        </div>
		`;
		view.querySelector('.btn-back').addEventListener('click', () => {
			this.showPartialClear();
		});
		view.querySelectorAll('.delete-single-note').forEach(btn => {
			btn.addEventListener('click', async (e) => {
				e.stopPropagation();
				const date = btn.dataset.date;
				const index = parseInt(btn.dataset.index);
				if (confirm(translations[currentLanguage].confirmDeleteSingleNote || "Delete this specific note?")) {
					await this.deleteSingleNote(date, index);
					this.showAllNotesForMonth(monthYear); // Refresh view
				}
			});
		});
	}
	async clearObjectStore(db, storeName) {
		return new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);
			const request = store.clear();
			request.onsuccess = () => resolve();
			request.onerror = (e) => reject(e.target.error);
		});
	}
    async clearAllAttachments() {
        const loading = showLoading();
        try {
            const db = await window.appManager.openDB();
            await this.clearObjectStore(db, 'attachments');
            showToast(translations[currentLanguage].attachmentsCleared || 'All attachments cleared successfully');
            this.showPartialClear(); // Refresh view
			} catch (error) {
            console.error('Error clearing attachments:', error);
            showToast(translations[currentLanguage].clearError || 'Error clearing attachments');
			} finally {
            hideLoading(loading);
		}
	}
    promptClearAll() {
        const lang = translations[currentLanguage];
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
		<div class="confirm-content">
		<h3><i class="icon">⚠️</i> ${lang.clearAllWarning || 'WARNING: Data Deletion'}</h3>
		<div class="clear-options">
		<label class="option-item">
		<input type="checkbox" id="clear-notes" checked>
		<span class="checkmark"></span>
		<span class="option-label">
		<i class="icon">📝</i> ${lang.clearAllNotes || 'All notes'}
		</span>
		</label>
		<label class="option-item">
		<input type="checkbox" id="clear-attachments" checked>
		<span class="checkmark"></span>
		<span class="option-label">
		<i class="icon">📎</i> ${lang.clearAllAttachments || 'All attachments'}
		</span>
		</label>
		<label class="option-item">
		<input type="checkbox" id="clear-sync" checked>
		<span class="checkmark"></span>
		<span class="option-label">
		<i class="icon">🔄</i> ${lang.clearAllSync || 'Sync queue'}
		</span>
		</label>
		<label class="option-item">
		<input type="checkbox" id="clear-localstorage">
		<span class="checkmark"></span>
		<span class="option-label">
		<i class="icon">💾</i> ${lang.clearAllLocalStorage || 'LocalStorage data'}
		<span class="warning-badge">!</span>
		</span>
		</label>
		</div>
		<div class="warning-message">
		<i class="icon">⚠️</i>
		<p>${lang.clearAllWarningText || 'This action cannot be undone. Make sure to export important data first.'}</p>
		</div>
		<div class="confirm-buttons">
		<button class="btn-cancel">${lang.cancel || 'Cancel'}</button>
		<button class="btn-confirm">${lang.clearConfirm || 'Clear Selected Data'}</button>
		</div>
		</div>
        `;
        document.body.appendChild(modal);
        // Add tooltips
        this.addTooltip(modal.querySelector('#clear-localstorage ~ .option-label'), 
		lang.localStorageWarning || 'Clearing localStorage will reset all preferences and cached data');
        // Event listeners
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.remove();
		});
        modal.querySelector('.btn-confirm').addEventListener('click', async () => {
            const clearNotes = modal.querySelector('#clear-notes').checked;
            const clearAttachments = modal.querySelector('#clear-attachments').checked;
            const clearSync = modal.querySelector('#clear-sync').checked;
            const clearLocalStorage = modal.querySelector('#clear-localstorage').checked;
            await this.executeClearAll(clearNotes, clearAttachments, clearSync, clearLocalStorage);
            modal.remove();
		});
	}
    async executeClearAll(clearNotes, clearAttachments, clearSync, clearLocalStorage) {
        const loading = showLoading();
        try {
            // Clear notes
            if (clearNotes) {
                window.notes = {};
                saveNotes();
			}
            // Clear IndexedDB
            if (clearAttachments || clearSync) {
                const db = await window.appManager.openDB();
                if (clearAttachments) await this.clearObjectStore(db, 'attachments');
                if (clearSync) await this.clearObjectStore(db, 'SYNC_QUEUE');
			}
            // Clear localStorage
            if (clearLocalStorage) {
                const langPref = localStorage.getItem('selectedLanguage');
                const calendarPref = localStorage.getItem('calendarSystem');
                localStorage.clear();
                if (langPref) localStorage.setItem('selectedLanguage', langPref);
                if (calendarPref) localStorage.setItem('calendarSystem', calendarPref);
			}
            showToast(translations[currentLanguage].clearCompleted || 'Data cleared successfully');
            this.closeSettings();
			} catch (error) {
            console.error('Clear all error:', error);
            showToast(translations[currentLanguage].clearError || 'Error clearing data');
			} finally {
            hideLoading(loading);
		}
	}
    addTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        element.appendChild(tooltip);
        element.addEventListener('mouseenter', () => {
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
		});
        element.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
		});
	}
	async clearMonth(monthYear) {
		const loading = showLoading();
		try {
			const [year, month] = monthYear.split('-').map(Number);
			const monthStart = new Date(year, month, 1);
			const monthEnd = new Date(year, month + 1, 0);
			// Delete notes in this month range
			Object.keys(window.notes).forEach(dateKey => {
				const noteDate = new Date(dateKey);
				if (noteDate >= monthStart && noteDate <= monthEnd) {
					delete window.notes[dateKey];
				}
			});
			saveNotes();
			showToast(translations[currentLanguage].monthCleared || 'Month data cleared');
			this.showPartialClear(); // Refresh view
			} catch (error) {
			console.error('Error clearing month:', error);
			showToast(translations[currentLanguage].clearError || 'Error clearing data');
			} finally {
			hideLoading(loading);
		}
	}
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
                        // Rough estimate - count keys for SYNC_QUEUE, full size for attachments
                        if (storeName === 'attachments' && cursor.value && cursor.value.file) {
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
}
// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});