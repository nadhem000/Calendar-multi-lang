class ResearchManager {
    constructor() {
        this.debug = true;
        this.log('ResearchManager initialized');
        
        // Initialize after a short delay to ensure notes are loaded
        setTimeout(() => {
            this.validateNotesStructure();
            this.initElements();
            this.bindEvents();
            this.updateLanguageTexts();
            this.setupLanguageObserver();
            
            // Expose debug function
            window.debugNotes = () => this.debugNotesContent();
		}, 300);
	}
    
    log(message, data = null) {
        if (this.debug) {
            console.log(`[Research] ${message}`, data || '');
		}
	}
    initElements() {
        this.log('Initializing elements');
        // Buttons
        this.generalBtn = document.querySelector('.settings-research-general-btn');
        this.dateBtn = document.querySelector('.settings-research-date-btn');
        this.noteBtn = document.querySelector('.settings-research-note-btn');
        // Views
        this.generalView = document.getElementById('research-general-view');
        this.dateView = document.getElementById('research-date-view');
        this.noteView = document.getElementById('research-note-view');
        // Initialize views with proper input fields
        this.initializeViews();
	}
    initializeViews() {
        this.log('Initializing research views');
        // General Research View
        if (this.generalView) {
            this.generalView.innerHTML = this.createGeneralResearchUI();
            this.log('Initialized general research view');
		}
        // Date Research View
        if (this.dateView) {
            this.dateView.innerHTML = this.createDateResearchUI();
            this.log('Initialized date research view');
		}
        // Note Research View
        if (this.noteView) {
            this.noteView.innerHTML = this.createNoteResearchUI();
            this.log('Initialized note research view');
		}
	}
    createGeneralResearchUI() {
        const lang = translations[currentLanguage];
        return `
		<div class="settings-research-section">
		<div class="search-input-group">
		<input type="text" id="general-search-input" class="settings-research-input" 
		placeholder="${lang.searchEverything || 'Search everything...'}"
		data-sanitize="true">
		<button class="settings-research-action-btn" id="general-search-btn">
		${lang.search || 'Search'}
		</button>
		</div>
		<div class="search-options">
		<label>
		<input type="checkbox" id="search-notes" checked>
		${lang.searchNotes || 'Notes'}
		</label>
		<label>
		<input type="checkbox" id="search-attachments" checked>
		${lang.attachments || 'Attachments'}
		</label>
		<label>
		<input type="checkbox" id="search-tips" checked>
		${lang.tip || 'Tips'}
		</label>
		</div>
		<div class="settings-research-results-container">
		<div class="settings-research-placeholder">
		${lang.generalResearchDesc || 'Search across all notes, tips, and attachments.'}
		</div>
		</div>
		</div>
        `;
	}
    createDateResearchUI() {
        const lang = translations[currentLanguage];
        const today = new Date().toISOString().split('T')[0];
        return `
		<div class="settings-research-section">
		<div class="search-input-group">
		<input type="date" id="date-search-input" class="settings-research-input" 
		value="${today}"
		max="${today}">
		<button class="settings-research-action-btn" id="date-search-btn">
		${lang.findDates || 'Find Dates'}
		</button>
		</div>
		<div class="date-range-options">
		<label>
		<input type="radio" name="date-range" value="exact" checked>
		${lang.exactDate || 'Exact date'}
		</label>
		<label>
		<input type="radio" name="date-range" value="week">
		${lang.entireWeek || 'Entire week'}
		</label>
		<label>
		<input type="radio" name="date-range" value="month">
		${lang.entireMonth || 'Entire month'}
		</label>
		</div>
		<div class="settings-research-results-container">
		<div class="settings-research-placeholder">
		${lang.dateResearchDesc || 'Find notes and events by specific date.'}
		</div>
		</div>
		</div>
        `;
	}
    createNoteResearchUI() {
        const lang = translations[currentLanguage];
        return `
		<div class="settings-research-section">
		<div class="search-input-group">
		<input type="text" id="note-search-input" class="settings-research-input" 
		placeholder="${lang.searchNotes || 'Search notes...'}"
		data-sanitize="true">
		<button class="settings-research-action-btn" id="note-search-btn">
		${lang.searchNotes || 'Search Notes'}
		</button>
		</div>
		<div class="search-filters">
		<select id="note-type-filter" class="settings-research-select">
		<option value="all">${lang.allTypes || 'All types'}</option>
		${noteTypes.map(type => `
		<option value="${type.type}">${type.icon} ${type.label}</option>
		`).join('')}
		</select>
		<select id="note-color-filter" class="settings-research-select">
		<option value="all">${lang.allColors || 'All colors'}</option>
		${noteColors.map(color => `
		<option value="${color.class}">${color.class.replace('note-color-', '')}</option>
		`).join('')}
		</select>
		</div>
		<div class="settings-research-results-container">
		<div class="settings-research-placeholder">
		${lang.noteResearchDesc || 'Search within note content.'}
		</div>
		</div>
		</div>
        `;
	}
    bindEvents() {
        this.log('Binding events');
        // Tab button clicks
        if (this.generalBtn) {
            this.generalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.log('General research tab clicked');
                this.showGeneralResearch();
			});
		}
        if (this.dateBtn) {
            this.dateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.log('Date research tab clicked');
                this.showDateResearch();
			});
		}
        if (this.noteBtn) {
            this.noteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.log('Note research tab clicked');
                this.showNoteResearch();
			});
		}
        // Search button events (using event delegation)
        document.addEventListener('click', (e) => {
			console.log('Click event target:', e.target); // Debug log
			if (e.target.classList.contains('settings-research-action-btn')) {
				const btnId = e.target.id;
				let input;
				if (btnId === 'general-search-btn') {
					input = document.getElementById('general-search-input');
					} else if (btnId === 'date-search-btn') {
					input = document.getElementById('date-search-input');
					} else if (btnId === 'note-search-btn') {
					input = document.getElementById('note-search-input');
				}
				if (input) {
					console.log('Searching with query:', input.value); // Debug log
					this.handleSearch(input, btnId.replace('-btn', ''));
				}
			}
		});
        // Enter key in inputs
        document.addEventListener('keypress', (e) => {
            if (e.target.classList.contains('settings-research-input') && e.key === 'Enter') {
                const inputId = e.target.id;
                this.log('Enter pressed in input', inputId);
                let searchType;
                if (inputId === 'general-search-input') {
                    searchType = 'general';
					} else if (inputId === 'date-search-input') {
                    searchType = 'date';
					} else if (inputId === 'note-search-input') {
                    searchType = 'note';
				}
                if (searchType) {
                    this.handleSearch(e.target, searchType);
				}
			}
		});
	}
	handleSearch(input, searchType) {
		try {
			const value = input.value.trim();
			const view = input.closest('[id$="-view"]');
			if (!value && searchType !== 'date') {
        console.log('Search parameters:', {
            value,
            searchType,
            inputId: input.id
        });
				this.showEmptySearchMessage(view);
				return;
			}
			// Get the results container more reliably
			const resultsContainer = view.querySelector('.settings-research-results-container');
			if (!resultsContainer) {
				console.error('Results container not found in view:', view);
				return;
			}
			// Show loading state
			resultsContainer.innerHTML = `
            <div class="settings-research-loading-spinner"></div>
            <p class="settings-research-loading-text">
			${translations[currentLanguage].loading || 'Searching...'}
            </p>
			`;
			// Process search immediately
			let results = [];
			switch(searchType) {
				case 'general':
                results = this.processGeneralSearch(value);
                break;
				case 'date':
                results = this.processDateSearch(value);
                break;
				case 'note':
                const typeFilter = document.getElementById('note-type-filter')?.value || 'all';
                const colorFilter = document.getElementById('note-color-filter')?.value || 'all';
                results = this.searchNotes(value, typeFilter, colorFilter);
                break;
			}
			// Always display results - add debug log
			console.log('Search results:', results); // Debug log
			this.displaySearchResults(resultsContainer, results, searchType);
			} catch (error) {
			console.error('Search error:', error);
			const resultsContainer = input?.closest('[id$="-view"]')?.querySelector('.settings-research-results-container');
			if (resultsContainer) {
				resultsContainer.innerHTML = `
                <div class="settings-research-error-message">
				${translations[currentLanguage].searchError || 'Error performing search'}
                </div>
				`;
			}
		}
	}
	
    processGeneralSearch(query) {
    try {
        if (!query || typeof query !== 'string') return [];
        
        const results = [];
        const queryLower = query.toLowerCase().trim();
        
        this.log('Starting general search for:', queryLower);
        this.debugNotesContent(); // Show current notes state
        
        if (!window.notes || typeof window.notes !== 'object') {
            this.log('Notes data is invalid:', window.notes);
            return [];
        }
        
        // Search notes
        Object.entries(window.notes).forEach(([date, dateNotes]) => {
            if (!Array.isArray(dateNotes)) {
                this.log('Invalid notes array for date:', date, dateNotes);
                return;
            }
            
            dateNotes.forEach((note, index) => {
                try {
                    // Normalize note object
                    const noteObj = this.normalizeNoteObject(note, date, index);
                    if (!noteObj) return;
                    
                    // Check text match (case insensitive)
                    const noteText = (noteObj.text || '').toString().toLowerCase();
                    if (noteText.includes(queryLower)) {
                        results.push(this.createSearchResult(noteObj, query, 'note'));
                    }
                } catch (e) {
                    console.error(`Error processing note at ${date}[${index}]:`, note, e);
                }
            });
        });
        
        // Search tips if enabled
        if (document.getElementById('search-tips')?.checked) {
            results.push(...this.searchTips(query));
        }
        
        this.log('General search completed. Results:', results);
        return results;
    } catch (error) {
        console.error('General search error:', error);
        return [];
    }
}
    processDateSearch(date) {
		const range = document.querySelector('input[name="date-range"]:checked')?.value || 'exact';
		// Debug: Log date search parameters
		console.log('Date search parameters:', {
			date,
			range,
			notesCount: window.notes ? Object.keys(window.notes).length : 0
		});
		const results = this.searchByDate(date, range);
		// Debug: Log date search results
		console.log('Date search results:', results);
		return results;
	}
    // Actual search implementations
	
    
searchNotes(query, typeFilter = 'all', colorFilter = 'all') {
    try {
        const results = [];
        const queryLower = query.toLowerCase().trim();
        
        this.log('Starting note search:', { query, typeFilter, colorFilter });
        
        if (!window.notes || typeof window.notes !== 'object') {
            this.log('Notes data is invalid:', window.notes);
            return [];
        }
        
        Object.entries(window.notes).forEach(([date, dateNotes]) => {
            if (!Array.isArray(dateNotes)) {
                this.log('Invalid notes array for date:', date, dateNotes);
                return;
            }
            
            dateNotes.forEach((note, index) => {
                try {
                    // Normalize note object
                    const noteObj = this.normalizeNoteObject(note, date, index);
                    if (!noteObj) return;
                    
                    // Apply filters
                    if (typeFilter !== 'all' && noteObj.type !== typeFilter) return;
                    if (colorFilter !== 'all' && noteObj.color !== colorFilter) return;
                    
                    // Check text match (case insensitive)
                    const noteText = (noteObj.text || '').toString().toLowerCase();
                    if (noteText.includes(queryLower)) {
                        results.push(this.createSearchResult(noteObj, query, 'note'));
                    }
                } catch (e) {
                    console.error(`Error processing note at ${date}[${index}]:`, note, e);
                }
            });
        });
        
        this.log('Note search completed. Results:', results);
        return results;
    } catch (error) {
        console.error('Note search error:', error);
        return [];
    }
}
    searchAttachments(query) {
        this.log('Searching attachments', query);
        // Implement attachment search when  have attachment data structure
        return [];
	}
    searchTips(query) {
        this.log('Searching tips', query);
        const results = [];
        const queryLower = query.toLowerCase();
        const lang = translations[currentLanguage];
        // Search in tips from addons.js
        Object.entries(iconTips[currentLanguage] || {}).forEach(([category, tips]) => {
            tips.forEach(tip => {
                if (tip.name.toLowerCase().includes(queryLower) || 
                    tip.description.toLowerCase().includes(queryLower)) {
                    results.push({
                        type: lang.tip || 'Tip',
                        preview: `${tip.name}: ${tip.description.substring(0, 50)}...`,
                        date: '', // Tips don't have dates
                        icon: '💡',
                        highlight: query,
                        originalTip: tip,
                        searchType: 'tip'
					});
				}
			});
		});
        return results;
	}
    
    searchByDate(date, range = 'exact') {
        try {
            const results = [];
            const searchDate = new Date(date);
            
            this.log('Starting date search:', { date, range });
			
            if (isNaN(searchDate)) {
                this.log('Invalid date format', date);
                return [];
			}
			
            if (!window.notes || typeof window.notes !== 'object') {
                this.log('Notes data is invalid:', window.notes);
                return [];
			}
			
            Object.entries(window.notes).forEach(([noteDateStr, dateNotes]) => {
                const noteDate = new Date(noteDateStr);
                
                if (isNaN(noteDate)) {
                    this.log('Invalid note date format:', noteDateStr);
                    return;
				}
				
                let matches = false;
                switch(range) {
                    case 'exact':
					matches = noteDate.toDateString() === searchDate.toDateString();
					break;
                    case 'week':
					const weekStart = new Date(searchDate);
					weekStart.setDate(searchDate.getDate() - searchDate.getDay());
					const weekEnd = new Date(weekStart);
					weekEnd.setDate(weekStart.getDate() + 6);
					matches = noteDate >= weekStart && noteDate <= weekEnd;
					break;
                    case 'month':
					matches = noteDate.getMonth() === searchDate.getMonth() && 
					noteDate.getFullYear() === searchDate.getFullYear();
					break;
				}
				
                if (matches) {
                    if (!Array.isArray(dateNotes)) {
                        this.log('Invalid notes array for date:', noteDateStr, dateNotes);
                        return;
					}
					
                    dateNotes.forEach((note, index) => {
                        try {
                            const noteObj = this.normalizeNoteObject(note, noteDateStr, index);
                            if (noteObj) {
                                results.push(this.createSearchResult(noteObj, '', 'note'));
							}
							} catch (e) {
                            console.error(`Error processing note at ${noteDateStr}[${index}]:`, note, e);
						}
					});
				}
			});
			
            this.log('Date search completed. Results:', results);
            return results;
			} catch (error) {
            console.error('Date search error:', error);
            return [];
		}
	}
    createSearchResult(noteObj, highlight, searchType) {
        const noteType = noteTypes.find(t => t.type === noteObj.type) || noteTypes[0];
        const noteColor = noteColors.find(c => c.class === noteObj.color) || noteColors[0];
        
        return {
            type: translations[currentLanguage].note || 'Note',
            preview: `${noteType.icon} ${noteObj.text.substring(0, 50)}${noteObj.text.length > 50 ? '...' : ''}`,
            date: noteObj.date,
            icon: noteType.icon,
            highlight: highlight,
            color: noteColor.color,
            originalNote: noteObj.original || noteObj,
            searchType: searchType || 'note',
            index: noteObj.index
		};
	}
    
normalizeNoteObject(note, date, index) {
    try {
        // Handle different note formats
        if (typeof note === 'string') {
            return {
                text: note,
                type: 'note',
                color: 'note-color-gray',
                date: date,
                index: index
            };
        } else if (typeof note === 'object' && note !== null) {
            // Ensure all required fields exist
            return {
                text: note.text || '',
                type: note.type || 'note',
                color: note.color || 'note-color-gray',
                time: note.time || '',
                date: note.date || date,
                index: index,
                original: note
            };
        }
        return null;
    } catch (e) {
        console.error('Error normalizing note:', note, e);
        return null;
    }
}
	displaySearchResults(container, results = [], searchType) {
		try {
			const lang = translations[currentLanguage];
			container.innerHTML = '';
			if (results.length > 0) {
				// Sort results - notes by date (newest first), tips alphabetically
				results.sort((a, b) => {
					if (a.date && b.date) return new Date(b.date) - new Date(a.date);
					if (a.originalTip && b.originalTip) return a.originalTip.name.localeCompare(b.originalTip.name);
					return 0;
				});
				container.innerHTML = `
				<h4 class="settings-research-results-title">
				${searchType === 'general' ? lang.searchResults : 
				searchType === 'date' ? lang.dateResults : 
				lang.noteResults}
				<span class="results-count">(${results.length})</span>
				</h4>
				<div class="settings-research-results-list">
				${results.map(result => `
				<div class="settings-research-result-item" 
				style="${result.color ? `border-left: 3px solid ${result.color}` : ''}"
				data-id="${result.originalNote?.date || result.originalTip?.id || ''}"
				data-type="${result.searchType || 'note'}">
				<div class="settings-research-result-icon">${result.icon || '📝'}</div>
				<div class="settings-research-result-content">
				<div class="settings-research-result-type">${result.type || lang.note || 'Note'}</div>
				<div class="settings-research-result-preview">
				${this.highlightText(result.preview || '', result.highlight || '')}
				</div>
				${result.date ? `
					<div class="settings-research-result-date">
					📅 ${result.date}
					${result.originalNote?.time ? `⏰ ${result.originalNote.time}` : ''}
					</div>
				` : ''}
				</div>
				</div>
				`).join('')}
				</div>
				`;
				// Add click handlers to results
				container.querySelectorAll('.settings-research-result-item').forEach(item => {
					item.addEventListener('click', () => {
						const resultType = item.dataset.type;
						const resultId = item.dataset.id;
						if (resultType === 'note') {
							this.openNoteFromSearch(resultId);
							} else if (resultType === 'tip') {
							this.openTipFromSearch(resultId);
						}
					});
				});
				} else {
				container.innerHTML = `
				<div class="settings-research-no-results">
				${searchType === 'date' ? 
				lang.noResultsForDate || 'No results for this date' : 
				lang.noResults || 'No results found'}
				</div>
				`;
			}
			} catch (error) {
			console.error('Display results error:', error);
			container.innerHTML = `
			<div class="settings-research-error-message">
			${translations[currentLanguage].searchError || 'Error displaying results'}
			</div>
			`;
		}
	}
	openNoteFromSearch(dateKey) {
		this.log('Opening note from search', dateKey);
		const date = new Date(dateKey);
		if (isNaN(date)) {
			this.log('Invalid date from search result', dateKey);
			return;
		}
		// Find the day element in the calendar
		const dayElements = document.querySelectorAll('.days > div:not(.empty)');
		const targetDay = Array.from(dayElements).find(day => {
			const dayNum = parseInt(day.textContent);
			const dayDate = new Date(currentYear, currentMonth, dayNum);
			return dayDate.toDateString() === date.toDateString();
		});
		if (targetDay) {
			// Close research views
			this.hideAllViews();
			document.getElementById('settings-modal').style.display = 'none';
			// Open the note modal
			openNoteModal(date, targetDay);
			} else {
			this.log('Could not find day element for date', dateKey);
		}
	}
	openTipFromSearch(tipId) {
		this.log('Opening tip from search', tipId);
		// Find which category this tip belongs to
		for (const [category, tips] of Object.entries(iconTips[currentLanguage] || {})) {
			const tip = tips.find(t => t.id === tipId);
			if (tip) {
				// Close research views
				this.hideAllViews();
				document.getElementById('settings-modal').style.display = 'none';
				// Open the tip modal
				showTipsModal(category);
				showTipDetail(category, tipId);
				return;
			}
		}
		this.log('Could not find tip with ID', tipId);
	}
	highlightText(text, query) {
		if (!query) return text;
		const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
		return text.replace(regex, '<span class="settings-research-highlighted">$1</span>');
	}
	escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	showEmptySearchMessage(view) {
		const lang = translations[currentLanguage];
		const resultsContainer = view?.querySelector('.settings-research-results-container');
		if (resultsContainer) {
			resultsContainer.innerHTML = `
			<div class="settings-research-no-results">
			${lang.validationErrorText || 'Please enter a search term'}
			</div>
			`;
		}
	}
	showGeneralResearch() {
		this.hideAllViews();
		this.generalView.classList.remove('hidden');
		this.updateActiveButton(this.generalBtn);
		this.log('Showing general research view');
	}
	showDateResearch() {
		this.hideAllViews();
		this.dateView.classList.remove('hidden');
		this.updateActiveButton(this.dateBtn);
		this.log('Showing date research view');
		// Set default date to today if not already set
		const dateInput = this.dateView.querySelector('#date-search-input');
		if (dateInput && !dateInput.value) {
			dateInput.value = new Date().toISOString().split('T')[0];
		}
	}
	showNoteResearch() {
		this.hideAllViews();
		this.noteView.classList.remove('hidden');
		this.updateActiveButton(this.noteBtn);
		this.log('Showing note research view');
	}
	hideAllViews() {
		[this.generalView, this.dateView, this.noteView].forEach(view => {
			if (view) view.classList.add('hidden');
		});
	}
	updateActiveButton(activeBtn) {
		[this.generalBtn, this.dateBtn, this.noteBtn].forEach(btn => {
			if (btn) btn.classList.toggle('active', btn === activeBtn);
		});
	}
	setupLanguageObserver() {
		const langSelect = document.getElementById('language-select-settings');
		if (langSelect) {
			langSelect.addEventListener('change', () => {
				this.log('Language changed, updating texts');
				this.updateLanguageTexts();
			});
		}
	}
	updateLanguageTexts() {
		const lang = translations[currentLanguage];
		this.log('Updating language texts');
		// Update button texts
		if (this.generalBtn) {
			this.generalBtn.innerHTML = `
			<span class="research-icon">🔍</span> ${lang.generalResearch || 'General Research'}
			`;
		}
		if (this.dateBtn) {
			this.dateBtn.innerHTML = `
			<span class="research-icon">📅</span> ${lang.dateResearch || 'Date Research'}
			`;
		}
		if (this.noteBtn) {
			this.noteBtn.innerHTML = `
			<span class="research-icon">📝</span> ${lang.noteResearch || 'Note Research'}
			`;
		}
		// Update view contents
		this.updateViewTexts();
	}
	updateViewTexts() {
		const lang = translations[currentLanguage];
		// General Research View
		if (this.generalView) {
			const input = this.generalView.querySelector('#general-search-input');
			const button = this.generalView.querySelector('#general-search-btn');
			const placeholder = this.generalView.querySelector('.settings-research-placeholder');
			if (input) input.placeholder = lang.searchEverything || 'Search everything...';
			if (button) button.textContent = lang.search || 'Search';
			if (placeholder) placeholder.textContent = lang.generalResearchDesc || 'Search across all notes, tips, and attachments.';
			// Update checkboxes
			const noteLabel = this.generalView.querySelector('#search-notes')?.nextElementSibling;
			const attachLabel = this.generalView.querySelector('#search-attachments')?.nextElementSibling;
			const tipLabel = this.generalView.querySelector('#search-tips')?.nextElementSibling;
			if (noteLabel) noteLabel.textContent = lang.searchNotes || 'Notes';
			if (attachLabel) attachLabel.textContent = lang.attachments || 'Attachments';
			if (tipLabel) tipLabel.textContent = lang.tip || 'Tips';
		}
		// Date Research View
		if (this.dateView) {
			const button = this.dateView.querySelector('#date-search-btn');
			const placeholder = this.dateView.querySelector('.settings-research-placeholder');
			if (button) button.textContent = lang.findDates || 'Find Dates';
			if (placeholder) placeholder.textContent = lang.dateResearchDesc || 'Find notes and events by specific date.';
			// Update radio buttons
			const exactLabel = this.dateView.querySelector('input[value="exact"]')?.nextElementSibling;
			const weekLabel = this.dateView.querySelector('input[value="week"]')?.nextElementSibling;
			const monthLabel = this.dateView.querySelector('input[value="month"]')?.nextElementSibling;
			if (exactLabel) exactLabel.textContent = lang.exactDate || 'Exact date';
			if (weekLabel) weekLabel.textContent = lang.entireWeek || 'Entire week';
			if (monthLabel) monthLabel.textContent = lang.entireMonth || 'Entire month';
		}
		// Note Research View
		if (this.noteView) {
			const input = this.noteView.querySelector('#note-search-input');
			const button = this.noteView.querySelector('#note-search-btn');
			const placeholder = this.noteView.querySelector('.settings-research-placeholder');
			if (input) input.placeholder = lang.searchNotes || 'Search notes...';
			if (button) button.textContent = lang.searchNotes || 'Search Notes';
			if (placeholder) placeholder.textContent = lang.noteResearchDesc || 'Search within note content.';
			// Update select options
			const typeSelect = this.noteView.querySelector('#note-type-filter');
			if (typeSelect) {
				typeSelect.innerHTML = `
				<option value="all">${lang.allTypes || 'All types'}</option>
				${noteTypes.map(type => `
				<option value="${type.type}">${type.icon} ${type.label}</option>
				`).join('')}
				`;
			}
			const colorSelect = this.noteView.querySelector('#note-color-filter');
			if (colorSelect) {
				colorSelect.innerHTML = `
				<option value="all">${lang.allColors || 'All colors'}</option>
				${noteColors.map(color => `
				<option value="${color.class}">${color.class.replace('note-color-', '')}</option>
				`).join('')}
				`;
			}
		}
	}
	
    validateNotesStructure() {
        if (!window.notes) {
            console.error('Notes object is not defined');
            window.notes = {};
            return false;
		}
		
        if (typeof window.notes !== 'object') {
            console.error('Notes is not an object:', window.notes);
            window.notes = {};
            return false;
		}
		
        // Convert any non-object notes to proper format
        let needsFix = false;
        Object.entries(window.notes).forEach(([date, notes]) => {
            if (!Array.isArray(notes)) {
                console.warn('Converting non-array notes for date:', date);
                window.notes[date] = [notes].filter(Boolean);
                needsFix = true;
			}
		});
		
        if (needsFix) {
            console.log('Notes structure was repaired');
            saveNotes();
		}
		
        return true;
	}
	_searchNotesFallback(query, typeFilter, colorFilter) {
		const results = [];
		const queryLower = query.toLowerCase();
		// Fallback search that handles different note structures
		for (const date in window.notes) {
			const dateNotes = window.notes[date];
			const notesArray = Array.isArray(dateNotes) ? dateNotes : [dateNotes];
			for (const note of notesArray) {
				if (!note || typeof note !== 'object') continue;
				// Apply filters
				if (typeFilter !== 'all' && note.type !== typeFilter) continue;
				if (colorFilter !== 'all' && note.color !== colorFilter) continue;
				// Check text
				const noteText = (note.text || '').toLowerCase();
				if (noteText.includes(queryLower)) {
					const noteType = noteTypes.find(t => t.type === note.type) || noteTypes[0];
					const noteColor = noteColors.find(c => c.class === note.color) || noteColors[0];
					results.push({
						type: translations[currentLanguage].note || 'Note',
						preview: `${noteType.icon} ${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}`,
						date: date,
						icon: noteType.icon,
						highlight: query,
						color: noteColor.color,
						originalNote: note,
						searchType: 'note'
					});
				}
			}
		}
		return results;
	}
	// helper method to debug note content:
	debugNotesContent() {
    console.group('=== Notes Content Debug ===');
    console.log('Current language:', currentLanguage);
    
    if (!window.notes) {
        console.error('window.notes is undefined');
    } else if (typeof window.notes !== 'object') {
        console.error('window.notes is not an object:', window.notes);
    } else if (Object.keys(window.notes).length === 0) {
        console.warn('window.notes exists but is empty');
    } else {
        console.log('Found notes for', Object.keys(window.notes).length, 'dates');
        
        // Show sample notes with more details
        const sampleDates = Object.keys(window.notes).slice(0, 3);
        sampleDates.forEach(date => {
            console.group(`Date: ${date}`);
            const notes = window.notes[date];
            if (!Array.isArray(notes)) {
                console.error('Notes is not an array:', notes);
            } else {
                notes.forEach((note, index) => {
                    console.log(`Note ${index}:`, {
                        text: note.text,
                        type: note.type,
                        color: note.color,
                        date: note.date,
                        time: note.time,
                        language: note.language
                    });
                });
            }
            console.groupEnd();
        });
    }
    console.groupEnd();
}
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.researchManager = new ResearchManager();
    // Expose debug method globally for testing
    window.debugNotes = function() {
        if (window.researchManager) {
            window.researchManager.debugNotesContent();
			} else {
            console.error('ResearchManager not initialized');
		}
	};
});		