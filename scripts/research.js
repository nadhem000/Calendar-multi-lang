// research.js
class ResearchManager {
    constructor() {
        this.initialized = false;
        this.initResearchTab();
        this.updateLanguageTexts();
	}
    // Sanitization method
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
    // Unified view management
    showResearchView(type) {
    console.log(`Attempting to show ${type} view`);
    
    // Hide all views first
    ['general', 'date', 'note'].forEach(t => {
        const view = document.getElementById(`settings-research-${t}-view`);
        if (view) {
            view.classList.add('hidden');
            view.innerHTML = ''; // Clear content
        }
    });

    // Show requested view
    const activeView = document.getElementById(`settings-research-${type}-view`);
    if (activeView) {
        activeView.classList.remove('hidden');
        
        // Force re-creation of content
        switch(type) {
            case 'general':
                this.showGeneralResearch();
                break;
            case 'date':
                this.showDateResearch(); 
                break;
            case 'note':
                this.showNoteResearch();
                break;
        }
        
        console.log(`View ${type} displayed`, activeView);
    }
}
    setupScopeCheckboxes() {
        document.querySelector('input[name="search-scope"][value="all"]').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.querySelectorAll('input[name="search-scope"]:not([value="all"])').forEach(checkbox => {
                    checkbox.checked = false;
				});
			}
		});
        document.querySelectorAll('input[name="search-scope"]:not([value="all"])').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.querySelector('input[name="search-scope"][value="all"]').checked = false;
				}
			});
		});
	}
	initResearchTab() {
console.log('Research buttons:', {
    general: document.querySelector('.settings-research-general-btn'),
    date: document.querySelector('.settings-research-date-btn'),
    note: document.querySelector('.settings-research-note-btn')
});

console.log('Research views:', {
    general: document.getElementById('settings-research-general-view'),
    date: document.getElementById('settings-research-date-view'),
    note: document.getElementById('settings-research-note-view')
});
        if (this.initialized) return;
        this.initialized = true;
        console.log('Initializing research tab...');
        // Single event delegation
        document.getElementById('settings-modal')?.addEventListener('click', (e) => {
            const target = e.target.closest('[class*="settings-research-"]');
            if (!target) return;
            // Sanitize and log button text
            const buttonText = this.sanitizeInput(target.textContent.trim());
            console.log(`${buttonText} button clicked`);
            if (target.classList.contains('settings-research-general-btn')) {
                this.showResearchView('general');
			} 
            else if (target.classList.contains('settings-research-date-btn')) {
                this.showResearchView('date');
			}
            else if (target.classList.contains('settings-research-note-btn')) {
                this.showResearchView('note');
			}
		});
        // Show default view
        this.showResearchView('general');
	}
    updateLanguageTexts() {
        const lang = translations[currentLanguage];
        // Update button texts if they exist
        const generalBtn = document.querySelector('.settings-research-general-btn');
        const dateBtn = document.querySelector('.settings-research-date-btn');
        const noteBtn = document.querySelector('.settings-research-note-btn');
        if (generalBtn) generalBtn.textContent = lang.generalResearch || 'General Research';
        if (dateBtn) dateBtn.textContent = lang.dateResearch || 'Date Research';
        if (noteBtn) noteBtn.textContent = lang.noteResearch || 'Note Research';
        // Update content if views are currently visible
        if (document.getElementById('settings-research-general-view')?.classList.contains('hidden') === false) {
            this.showGeneralResearch();
		}
        if (document.getElementById('settings-research-date-view')?.classList.contains('hidden') === false) {
            this.showDateResearch();
		}
        if (document.getElementById('settings-research-note-view')?.classList.contains('hidden') === false) {
            this.showNoteResearch();
		}
	}
    showGeneralResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('settings-research-general-view');
        // Sanitize all text inputs
        const sanitized = {
            title: this.sanitizeInput(lang.generalResearch || 'Global Search'),
            desc: this.sanitizeInput(lang.generalResearchDesc || 'Search across all data types in the application.'),
            placeholder: this.sanitizeInput(lang.searchEverything || 'Search everything...'),
            searchText: this.sanitizeInput(lang.search || 'Search'),
            searchAll: this.sanitizeInput(lang.searchAll || 'Search All'),
            searchNotes: this.sanitizeInput(lang.searchNotes || 'Search Notes'),
            searchTips: this.sanitizeInput(lang.searchTips || 'Search Tips'),
            searchAttachments: this.sanitizeInput(lang.searchAttachments || 'Search Attachments')
		};
        view.innerHTML = `
        <div class="settings-research-content">
		<h4>${sanitized.title}</h4>
		<p>${sanitized.desc}</p>
		<div class="settings-research-searchbox">
		<input type="text" id="global-search-input" class="settings-research-input" 
		placeholder="${sanitized.placeholder}">
		<button id="global-search-btn" class="settings-research-action-btn">
		${sanitized.searchText}
		</button>
		</div>
		<div class="settings-research-scopes">
		<div class="settings-research-scope-options">
		<label class="settings-research-scope-option">
		<input type="checkbox" name="search-scope" value="all" checked>
		${sanitized.searchAll}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="search-scope" value="notes">
		${sanitized.searchNotes}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="search-scope" value="tips">
		${sanitized.searchTips}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="search-scope" value="attachments">
		${sanitized.searchAttachments}
		</label>
		</div>
		</div>
		<div id="global-search-results" class="settings-research-results hidden">
		<h5>${this.sanitizeInput(lang.searchResults || 'Search Results')}</h5>
		<div class="settings-research-results-list"></div>
		</div>
        </div>`;
        // Add event listeners
        document.getElementById('global-search-btn').addEventListener('click', () => this.performGlobalSearch());
        this.setupScopeCheckboxes();
        view.classList.remove('hidden');
	}
    performGlobalSearch() {
		const searchTerm = document.getElementById('global-search-input').value.trim();
		if (!searchTerm) return;
		// Get selected scopes
		const selectedScopes = [];
		document.querySelectorAll('input[name="search-scope"]:checked').forEach(checkbox => {
			selectedScopes.push(checkbox.value);
		});
		// If "all" is selected, search everything
		const searchAll = selectedScopes.includes('all');
		const searchNotes = searchAll || selectedScopes.includes('notes');
		const searchTips = searchAll || selectedScopes.includes('tips');
		const searchAttachments = searchAll || selectedScopes.includes('attachments');
		const results = [];
		// Search notes if selected
		if (searchNotes) {
			const notes = JSON.parse(localStorage.getItem('calendarNotes') || '{}'); 
			Object.entries(notes).forEach(([date, noteList]) => {
				noteList.forEach((note, index) => {
					if (note.text.toLowerCase().includes(searchTerm.toLowerCase())) {
						results.push({
							type: 'note',
							date: date,
							index: index,
							text: note.text,
							preview: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : '')
						});
					}
				});
			});
		}
        // Search tips if selected
		if (searchTips) {
			Object.entries(iconTips[currentLanguage]).forEach(([category, tipList]) => {
				tipList.forEach(tip => {
					if (tip.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
						tip.description.toLowerCase().includes(searchTerm.toLowerCase())) {
						results.push({
							type: 'tip',
							category: category,
							id: tip.id,
							name: tip.name,
							preview: tip.description.substring(0, 50) + (tip.description.length > 50 ? '...' : '')
						});
					}
				});
			});
		}
		// Search attachments if selected (placeholder - would need actual attachment data)
		if (searchAttachments) {
			// This would require access to the attachments store in IndexedDB
			// For now, we'll just show a message
			if (results.length === 0) {
				results.push({
					type: 'info',
					text: 'Attachment search would be implemented with actual attachment data'
				});
			}
		}
		this.displaySearchResults(results);
	}
    displaySearchResults(results) {
        const resultsContainer = document.querySelector('#global-search-results .settings-research-results-list');
        const lang = translations[currentLanguage];
        if (results.length === 0) {
            resultsContainer.innerHTML = `<div class="settings-research-no-results">${lang.noResultsFound || 'No results found'}</div>`;
            document.getElementById('global-search-results').classList.remove('hidden');
            return;
		}
        let html = '';
        results.forEach(result => {
            if (result.type === 'note') {
                html += `
				<div class="settings-research-result-item settings-research-result-note" 
				data-date="${result.date}" data-index="${result.index}">
				<div class="settings-research-result-icon">📝</div>
				<div class="settings-research-result-content">
				<div class="settings-research-result-title">
				${result.text.substring(0, 30)}${result.text.length > 30 ? '...' : ''}
				</div>
				<div class="settings-research-result-preview">
				${result.preview}
				</div>
				<div class="settings-research-result-meta">
				${lang.note || 'Note'} • ${result.date}
				</div>
				</div>
				</div>
                `;
				} else if (result.type === 'tip') {
                html += `
				<div class="settings-research-result-item settings-research-result-tip" 
				data-category="${result.category}" data-id="${result.id}">
				<div class="settings-research-result-icon">💡</div>
				<div class="settings-research-result-content">
				<div class="settings-research-result-title">
				${result.name}
				</div>
				<div class="settings-research-result-preview">
				${result.preview}
				</div>
				<div class="settings-research-result-meta">
				${lang.tip || 'Tip'} • ${translations[currentLanguage].icons[result.category] || result.category}
				</div>
				</div>
				</div>
                `;
				} else if (result.type === 'info') {
                html += `
				<div class="settings-research-result-item settings-research-result-info">
				<div class="settings-research-result-icon">ℹ️</div>
				<div class="settings-research-result-content">
				${result.text}
				</div>
				</div>
                `;
			}
		});
        resultsContainer.innerHTML = html;
        document.getElementById('global-search-results').classList.remove('hidden');
        // Add click handlers for note results
        document.querySelectorAll('.settings-research-result-note').forEach(item => {
            item.addEventListener('click', () => {
                const date = item.dataset.date;
                const index = item.dataset.index;
                this.navigateToNote(date, index);
			});
		});
        // Add click handlers for tip results
        document.querySelectorAll('.settings-research-result-tip').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                const id = item.dataset.id;
                this.navigateToTip(category, id);
			});
		});
	}
    async navigateToNote(date, index) {
		try {
			// Close settings modal first
			document.getElementById('settings-modal').style.display = 'none';
			// Parse the note date
			const noteDate = new Date(date);
			currentYear = noteDate.getFullYear();
			currentMonth = noteDate.getMonth();
			// Render the calendar to the correct month
			renderCalendar(translations[window.currentLanguage]);
			// Wait for calendar to render
			await new Promise(resolve => setTimeout(resolve, 100));
			// Find all day elements and click the matching one
			const dayElements = document.querySelectorAll('.days > div:not(.empty)');
			const targetDay = noteDate.getDate();
			for (const dayElement of dayElements) {
				if (parseInt(dayElement.textContent) === targetDay) {
					dayElement.click();
					break;
				}
			}
			} catch (error) {
			console.error('Error navigating to note:', error);
			showToast('Error navigating to note');
		}
	}
    navigateToTip(category, id) {
        // Show the tip modal
        showTipsModal(category);
        // Show the specific tip
        setTimeout(() => {
            showTipDetail(category, id);
		}, 100);
	}
	showDateResearch() {
		const lang = translations[currentLanguage];
		const view = document.getElementById('settings-research-date-view');
		const sanitized = {
			title: this.sanitizeInput(lang.dateResearch || 'Date Research'),
			desc: this.sanitizeInput(lang.dateResearchDesc || 'Find and navigate to specific dates'),
			buttonText: this.sanitizeInput(lang.findDates || 'Find Dates'),
			placeholder: this.sanitizeInput(lang.selectDate || 'Select a date')
		};
		view.innerHTML = `
		<div class="settings-research-content">
        <h4>${sanitized.title}</h4>
        <p>${sanitized.desc}</p>
        <div class="settings-research-searchbox">
		<input type="date" id="date-search-input" class="settings-research-input" 
		placeholder="${sanitized.placeholder}">
		<button id="date-search-btn" class="settings-research-action-btn">
		${sanitized.buttonText}
		</button>
        </div>
        <div id="date-search-results" class="settings-research-results hidden">
		<h5>${this.sanitizeInput(lang.dateResults || 'Date Information')}</h5>
		<div class="settings-research-results-list"></div>
        </div>
		</div>`;
		// Add event listeners
		document.getElementById('date-search-btn').addEventListener('click', () => {
			const dateInput = document.getElementById('date-search-input').value;
			if (dateInput) {
				this.performDateSearch(dateInput);
			}
		});
		// Allow pressing Enter in the input field
		document.getElementById('date-search-input').addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				const dateInput = document.getElementById('date-search-input').value;
				if (dateInput) {
					this.performDateSearch(dateInput);
				}
			}
		});
		view.classList.remove('hidden');
	}
	async performDateSearch(dateString) {
		try {
			const searchDate = new Date(dateString);
			const resultsContainer = document.querySelector('#date-search-results .settings-research-results-list');
			const lang = translations[currentLanguage];
			// Format the date for display
			const formattedDate = searchDate.toLocaleDateString(currentLanguage, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			// Check if there are notes for this date
			const dateKey = searchDate.toISOString().split('T')[0];
			const notesForDate = window.notes[dateKey] || [];
			let html = `
			<div class="settings-research-result-item settings-research-result-date">
            <div class="settings-research-result-icon">📅</div>
            <div class="settings-research-result-content">
			<div class="settings-research-result-title">
			${formattedDate}
			</div>
			<div class="settings-research-result-preview">
			${notesForDate.length > 0 ? 
			`${notesForDate.length} ${lang.notes || 'notes'}` : 
			lang.noNotesForDate || 'No notes for this date'}
			</div>
            </div>
            <button class="settings-research-navigate-btn" data-date="${dateKey}">
			${lang.navigateToDate || 'Go to date'}
            </button>
			</div>`;
			resultsContainer.innerHTML = html;
			document.getElementById('date-search-results').classList.remove('hidden');
			// Add click handler for navigation button
			document.querySelector('.settings-research-navigate-btn').addEventListener('click', (e) => {
				const date = e.target.dataset.date;
				this.navigateToDate(date);
			});
			} catch (error) {
			console.error('Date search error:', error);
			showToast(lang.dateSearchError || 'Invalid date format');
		}
	}
	async navigateToDate(dateString) {
		try {
			// Close settings modal first
			document.getElementById('settings-modal').style.display = 'none';
			// Parse the date
			const targetDate = new Date(dateString);
			currentYear = targetDate.getFullYear();
			currentMonth = targetDate.getMonth();
			// Render the calendar to the correct month
			renderCalendar(translations[window.currentLanguage]);
			// Wait for calendar to render
			await new Promise(resolve => setTimeout(resolve, 100));
			// Find all day elements and click the matching one
			const dayElements = document.querySelectorAll('.days > div:not(.empty)');
			const targetDay = targetDate.getDate();
			for (const dayElement of dayElements) {
				if (parseInt(dayElement.textContent) === targetDay) {
					// Highlight the date temporarily
					dayElement.classList.add('settings-research-highlighted-note-date');
					setTimeout(() => {
						dayElement.classList.remove('settings-research-highlighted-note-date');
					}, 2000);
					// Open the note modal if there are notes
					const dateKey = targetDate.toISOString().split('T')[0];
					if (window.notes[dateKey] && window.notes[dateKey].length > 0) {
						dayElement.click();
					}
					break;
				}
			}
			} catch (error) {
			console.error('Error navigating to date:', error);
			showToast('Error navigating to date');
		}
	}
	showNoteResearch() {
		const lang = translations[currentLanguage];
		const view = document.getElementById('settings-research-note-view');
		const sanitized = {
			title: this.sanitizeInput(lang.noteResearch || 'Note Research'),
			desc: this.sanitizeInput(lang.noteResearchDesc || 'Search through all your notes with advanced filters.'),
			placeholder: this.sanitizeInput(lang.searchNotes || 'Search notes...'),
			searchText: this.sanitizeInput(lang.search || 'Search'),
			searchAll: this.sanitizeInput(lang.searchAll || 'Search All'),
			searchDate: this.sanitizeInput(lang.searchDate || 'Search by Date'),
			searchTime: this.sanitizeInput(lang.searchTime || 'Search by Time'),
			searchType: this.sanitizeInput(lang.searchType || 'Search by Type'),
			searchColor: this.sanitizeInput(lang.searchColor || 'Search by Color'),
			searchAttachments: this.sanitizeInput(lang.searchAttachments || 'Search Attachments')
		};
		view.innerHTML = `
		<div class="settings-research-content">
        <h4>${sanitized.title}</h4>
        <p>${sanitized.desc}</p>
        <div class="settings-research-searchbox">
		<input type="text" id="note-search-input" class="settings-research-input" 
		placeholder="${sanitized.placeholder}">
		<button id="note-search-btn" class="settings-research-action-btn">
		${sanitized.searchText}
		</button>
        </div>
        <div class="settings-research-scopes">
		<div class="settings-research-scope-options">
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="all" checked>
		${sanitized.searchAll}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="date">
		${sanitized.searchDate}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="time">
		${sanitized.searchTime}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="type">
		${sanitized.searchType}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="color">
		${sanitized.searchColor}
		</label>
		<label class="settings-research-scope-option">
		<input type="checkbox" name="note-search-scope" value="attachments">
		${sanitized.searchAttachments}
		</label>
		</div>
        </div>
        <div id="note-search-results" class="settings-research-results hidden">
		<h5>${this.sanitizeInput(lang.searchResults || 'Search Results')}</h5>
		<div class="settings-research-results-list"></div>
        </div>
		</div>`;
		// Add event listeners
		document.getElementById('note-search-btn').addEventListener('click', () => this.performNoteSearch());
		this.setupNoteScopeCheckboxes();
		view.classList.remove('hidden');
	}
	setupNoteScopeCheckboxes() {
		document.querySelector('input[name="note-search-scope"][value="all"]').addEventListener('change', (e) => {
			if (e.target.checked) {
				document.querySelectorAll('input[name="note-search-scope"]:not([value="all"])').forEach(checkbox => {
					checkbox.checked = false;
				});
			}
		});
		document.querySelectorAll('input[name="note-search-scope"]:not([value="all"])').forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				if (e.target.checked) {
					document.querySelector('input[name="note-search-scope"][value="all"]').checked = false;
				}
			});
		});
	}
	performNoteSearch() {
		const searchTerm = document.getElementById('note-search-input').value.trim();
		// Get selected scopes
		const selectedScopes = [];
		document.querySelectorAll('input[name="note-search-scope"]:checked').forEach(checkbox => {
			selectedScopes.push(checkbox.value);
		});
		// If "all" is selected, search everything
		const searchAll = selectedScopes.includes('all');
		const searchDate = searchAll || selectedScopes.includes('date');
		const searchTime = searchAll || selectedScopes.includes('time');
		const searchType = searchAll || selectedScopes.includes('type');
		const searchColor = searchAll || selectedScopes.includes('color');
		const searchAttachments = searchAll || selectedScopes.includes('attachments');
		const results = [];
		const notes = JSON.parse(localStorage.getItem('calendarNotes') || '{}'); 
		Object.entries(notes).forEach(([date, noteList]) => {
			noteList.forEach((note, index) => {
				let matches = false;
				// Search in text content
				if (searchTerm && note.text.toLowerCase().includes(searchTerm.toLowerCase())) {
					matches = true;
				}
				// Search by date if selected
				if (searchDate && date.includes(searchTerm)) {
					matches = true;
				}
				// Search by time if selected
				if (searchTime && note.time && note.time.includes(searchTerm)) {
					matches = true;
				}
				// Search by type if selected
				if (searchType && note.type && note.type.toLowerCase().includes(searchTerm.toLowerCase())) {
					matches = true;
				}
				// Search by color if selected
				if (searchColor && note.color && note.color.toLowerCase().includes(searchTerm.toLowerCase())) {
					matches = true;
				}
				// Search attachments placeholder (would need actual attachment data)
				if (searchAttachments && (note.attachments || []).length > 0) {
					matches = true;
				}
				if (matches || (!searchTerm && selectedScopes.length > 0)) {
					const noteType = noteTypes.find(t => t.type === note.type) || { icon: '📝', label: 'Note' };
					const noteColor = noteColors.find(c => c.class === note.color) || { color: '#cccccc' };
					results.push({
						type: 'note',
						date: date,
						index: index,
						text: note.text,
						time: note.time || '',
						noteType: noteType.label,
						noteTypeIcon: noteType.icon,
						noteColor: noteColor.color,
						preview: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : '')
					});
				}
			});
		});
		this.displayNoteSearchResults(results);
	}
	displayNoteSearchResults(results) {
		const resultsContainer = document.querySelector('#note-search-results .settings-research-results-list');
		const lang = translations[currentLanguage];
		if (results.length === 0) {
			resultsContainer.innerHTML = `
			<div class="settings-research-no-results">
			${lang.noResultsFound || 'No results found'}
			</div>`;
			document.getElementById('note-search-results').classList.remove('hidden');
			return;
		}
		let html = '';
		results.forEach(result => {
			html += `
			<div class="settings-research-result-item settings-research-result-note" 
			data-date="${result.date}" data-index="${result.index}">
			<div class="settings-research-result-icon" style="color: ${result.noteColor}">
			${result.noteTypeIcon}
			</div>
			<div class="settings-research-result-content">
			<div class="settings-research-result-title">
			${result.text.substring(0, 30)}${result.text.length > 30 ? '...' : ''}
			</div>
			<div class="settings-research-result-preview">
			${result.preview}
			</div>
			<div class="settings-research-result-meta">
			${result.noteType} • ${result.date} ${result.time ? '• ' + result.time : ''}
			</div>
			</div>
			</div>`;
		});
		resultsContainer.innerHTML = html;
		document.getElementById('note-search-results').classList.remove('hidden');
		// Add click handlers for note results
		document.querySelectorAll('.settings-research-result-note').forEach(item => {
			item.addEventListener('click', () => {
				const date = item.dataset.date;
				const index = item.dataset.index;
				this.navigateToNote(date, index);
			});
		});
	}
}
document.addEventListener('DOMContentLoaded', () => {
// Replace the initialization at bottom with:
if (!window.researchManagerInitialized) {
    window.researchManager = new ResearchManager();
    window.researchManagerInitialized = true;
    console.log('ResearchManager initialized once');
}
});