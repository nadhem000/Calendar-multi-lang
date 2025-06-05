class ResearchManager {
    constructor() {
        this.currentResults = [];
        document.addEventListener('DOMContentLoaded', () => {
            this.initResearchTab();
            this.updateLanguageTexts();
        });
console.log('ResearchManager initialized');
console.log('General button exists:', !!document.querySelector('.settings-research-general-btn'));
console.log('General view exists:', !!document.getElementById('research-general-view'));
    }
    initResearchTab() {
    const generalBtn = document.querySelector('.settings-research-general-btn');
    const dateBtn = document.querySelector('.settings-research-date-btn');
    const noteBtn = document.querySelector('.settings-research-note-btn');
    
    console.log('Buttons:', {generalBtn, dateBtn, noteBtn});
    
    if (generalBtn) {
        generalBtn.addEventListener('click', () => {
            console.log('General research clicked');
            this.showGeneralResearch();
        });
    }
    
    if (dateBtn) {
        dateBtn.addEventListener('click', () => {
            console.log('Date research clicked');
            this.showDateResearch();
        });
    }
    
    if (noteBtn) {
        noteBtn.addEventListener('click', () => {
            console.log('Note research clicked');
            this.showNoteResearch();
        });
    }
}
    updateLanguageTexts() {
        const lang = translations[currentLanguage];
        const generalBtn = document.querySelector('.settings-research-general-btn');
        const dateBtn = document.querySelector('.settings-research-date-btn');
        const noteBtn = document.querySelector('.settings-research-note-btn');
        if (generalBtn) generalBtn.textContent = lang.generalResearch || 'General Research';
        if (dateBtn) dateBtn.textContent = lang.dateResearch || 'Date Research';
        if (noteBtn) noteBtn.textContent = lang.noteResearch || 'Note Research';
        if (document.getElementById('research-general-view')?.classList.contains('hidden') === false) {
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
        const view = document.getElementById('research-general-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.generalResearch || 'General Research'}</h4>
                <p>${lang.generalResearchDesc || 'Search across all notes, tips, and attachments.'}</p>
                <div class="settings-research-placeholder">
                    <input type="text" id="settings-research-general-search-input" class="settings-research-input" 
                        placeholder="${lang.searchEverything || 'Search everything...'}">
                    <button id="settings-research-general-search-btn" class="settings-research-action-btn">
                        ${lang.search || 'Search'}
                    </button>
                </div>
                <div id="settings-research-general-results" class="settings-research-results-container"></div>
            </div>
        `;
        document.getElementById('settings-research-general-search-btn').addEventListener('click', () => {
            this.performGeneralSearch();
        });
        document.getElementById('settings-research-general-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performGeneralSearch();
        });
        view.classList.remove('hidden');
    }
    showDateResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('settings-research-date-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.dateResearch || 'Date Research'}</h4>
                <p>${lang.dateResearchDesc || 'Find notes and events by specific date.'}</p>
                <div class="settings-research-placeholder">
                    <input type="date" id="settings-research-date-search-input" class="settings-research-input">
                    <button id="settings-research-date-search-btn" class="settings-research-action-btn">
                        ${lang.findDates || 'Find Dates'}
                    </button>
                </div>
                <div id="settings-research-date-results" class="settings-research-results-container"></div>
            </div>
        `;
        document.getElementById('settings-research-date-search-btn').addEventListener('click', () => {
            this.performDateSearch();
        });
        view.classList.remove('hidden');
    }
    showNoteResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('settings-research-note-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.noteResearch || 'Note Research'}</h4>
                <p>${lang.noteResearchDesc || 'Search within note content.'}</p>
                <div class="settings-research-placeholder">
                    <input type="text" id="settings-research-note-search-input" class="settings-research-input" 
                        placeholder="${lang.searchNotes || 'Search notes...'}">
                    <button id="settings-research-note-search-btn" class="settings-research-action-btn">
                        ${lang.searchNotes || 'Search Notes'}
                    </button>
                </div>
                <div id="settings-research-note-results" class="settings-research-results-container"></div>
            </div>
        `;
        document.getElementById('settings-research-note-search-btn').addEventListener('click', () => {
            this.performNoteSearch();
        });
        document.getElementById('settings-research-note-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performNoteSearch();
        });
        view.classList.remove('hidden');
    }
    async performGeneralSearch() {
        const query = document.getElementById('settings-research-general-search-input').value.trim().toLowerCase();
        if (!query) return;
        const resultsContainer = document.getElementById('settings-research-general-results');
        resultsContainer.innerHTML = '<div class="settings-research-loading-spinner"></div>';
        try {
            // Search notes
            const noteResults = this.searchNotes(query);
            // Search tips (if available)
            const tipResults = window.iconTips ? this.searchTips(query) : [];
            // Search attachments (if available)
            const attachmentResults = window.attachments ? this.searchAttachments(query) : [];
            // Combine all results
            const allResults = [...noteResults, ...tipResults, ...attachmentResults];
            this.currentResults = allResults;
            if (allResults.length === 0) {
                resultsContainer.innerHTML = `<p class="settings-research-no-results">${translations[currentLanguage].noResults || 'No results found'}</p>`;
                return;
            }
            resultsContainer.innerHTML = `
                <h5>${translations[currentLanguage].searchResults || 'Search Results'} (${allResults.length})</h5>
                <div class="settings-research-results-list">
                    ${allResults.map(result => this.renderSearchResult(result)).join('')}
                </div>
            `;
            // Add click handlers to result items
            document.querySelectorAll('.settings-research-result-item').forEach(item => {
                item.addEventListener('click', () => this.handleResultClick(item.dataset));
            });
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `<p class="settings-research-error-message">${translations[currentLanguage].searchError || 'Error performing search'}</p>`;
        }
    }
    async performNoteSearch() {
        const query = document.getElementById('settings-research-note-search-input').value.trim().toLowerCase();
        if (!query) return;
        const resultsContainer = document.getElementById('settings-research-note-results');
        resultsContainer.innerHTML = '<div class="settings-research-loading-spinner"></div>';
        try {
            const results = this.searchNotes(query);
            this.currentResults = results;
            if (results.length === 0) {
                resultsContainer.innerHTML = `<p class="settings-research-no-results">${translations[currentLanguage].noResults || 'No results found'}</p>`;
                return;
            }
            resultsContainer.innerHTML = `
                <h5>${translations[currentLanguage].noteResults || 'Note Results'} (${results.length})</h5>
                <div class="settings-research-results-list">
                    ${results.map(result => this.renderSearchResult(result)).join('')}
                </div>
            `;
            document.querySelectorAll('.settings-research-result-item').forEach(item => {
                item.addEventListener('click', () => this.handleResultClick(item.dataset));
            });
        } catch (error) {
            console.error('Note search error:', error);
            resultsContainer.innerHTML = `<p class="settings-research-error-message">${translations[currentLanguage].searchError || 'Error performing search'}</p>`;
        }
    }
    async performDateSearch() {
        const dateInput = document.getElementById('settings-research-date-search-input').value;
        if (!dateInput) return;
        const searchDate = new Date(dateInput).toISOString().split('T')[0];
        const resultsContainer = document.getElementById('settings-research-date-results');
        resultsContainer.innerHTML = '<div class="settings-research-loading-spinner"></div>';
        try {
            const results = [];
            // Search notes for this date
            if (window.notes && window.notes[searchDate]) {
                window.notes[searchDate].forEach((note, index) => {
                    results.push({
                        type: 'note',
                        date: searchDate,
                        index: index,
                        text: note.text,
                        preview: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : ''),
                        color: note.color
                    });
                });
            }
            // Search events/attachments for this date if available
            // (Add your event/attachment search logic here)
            this.currentResults = results;
            if (results.length === 0) {
                resultsContainer.innerHTML = `<p class="settings-research-no-results">${translations[currentLanguage].noResultsForDate || 'No results for this date'}</p>`;
                return;
            }
            resultsContainer.innerHTML = `
                <h5>${translations[currentLanguage].dateResults || 'Date Results'} (${results.length})</h5>
                <div class="settings-research-results-list">
                    ${results.map(result => this.renderSearchResult(result)).join('')}
                </div>
            `;
            document.querySelectorAll('.settings-research-result-item').forEach(item => {
                item.addEventListener('click', () => this.handleResultClick(item.dataset));
            });
        } catch (error) {
            console.error('Date search error:', error);
            resultsContainer.innerHTML = `<p class="settings-research-error-message">${translations[currentLanguage].searchError || 'Error performing search'}</p>`;
        }
    }
    searchNotes(query) {
        const results = [];
        if (!window.notes) return results;
        Object.entries(window.notes).forEach(([date, notes]) => {
            notes.forEach((note, index) => {
                if (note.text.toLowerCase().includes(query)) {
                    results.push({
                        type: 'note',
                        date: date,
                        index: index,
                        text: note.text,
                        preview: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : ''),
                        color: note.color
                    });
                }
            });
        });
        return results;
    }
    searchTips(query) {
        const results = [];
        const lang = currentLanguage;
        if (!window.iconTips || !window.iconTips[lang]) return results;
        Object.entries(window.iconTips[lang]).forEach(([category, tips]) => {
            tips.forEach(tip => {
                if (tip.name.toLowerCase().includes(query) || 
                    tip.description.toLowerCase().includes(query)) {
                    results.push({
                        type: 'tip',
                        category: category,
                        id: tip.id || Math.random().toString(36).substring(7),
                        name: tip.name,
                        description: tip.description,
                        preview: tip.description.substring(0, 50) + (tip.description.length > 50 ? '...' : '')
                    });
                }
            });
        });
        return results;
    }
    searchAttachments(query) {
        const results = [];
        if (!window.attachments) return results;
        window.attachments.forEach(attachment => {
            if (attachment.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'attachment',
                    id: attachment.id,
                    name: attachment.name,
                    date: attachment.date,
                    preview: attachment.name + ' (' + (attachment.size / 1024).toFixed(2) + ' KB)'
                });
            }
        });
        return results;
    }
    renderSearchResult(result) {
        const lang = translations[currentLanguage];
        let icon = '📝';
        let typeLabel = lang.note || 'Note';
        if (result.type === 'tip') {
            icon = '💡';
            typeLabel = lang.tip || 'Tip';
        } else if (result.type === 'attachment') {
            icon = '📎';
            typeLabel = lang.attachment || 'Attachment';
        }
        return `
            <div class="settings-research-result-item" data-type="${result.type}" 
                 ${result.type === 'note' ? `data-date="${result.date}" data-index="${result.index}"` : ''}
                 ${result.type === 'tip' ? `data-category="${result.category}" data-id="${result.id}"` : ''}
                 ${result.type === 'attachment' ? `data-id="${result.id}"` : ''}>
                <div class="settings-research-result-icon">${icon}</div>
                <div class="settings-research-result-content">
                    <div class="settings-research-result-type">${typeLabel}</div>
                    <div class="settings-research-result-preview">${result.preview || result.text || result.description || result.name}</div>
                    ${result.date ? `<div class="settings-research-result-date">${result.date}</div>` : ''}
                </div>
            </div>
        `;
    }
    handleResultClick(data) {
        switch(data.type) {
            case 'note':
                this.openNote(data.date, parseInt(data.index));
                break;
            case 'tip':
                this.openTip(data.category, data.id);
                break;
            case 'attachment':
                this.openAttachment(data.id);
                break;
        }
    }
    openNote(date, index) {
        // Close research views first
        document.querySelectorAll('[id$="-view"]').forEach(view => {
            view.classList.add('hidden');
        });
        // Open the note in calendar view
        const noteDate = new Date(date);
        currentYear = noteDate.getFullYear();
        currentMonth = noteDate.getMonth();
        renderCalendar(translations[currentLanguage]);
        // Scroll to and highlight the note
        setTimeout(() => {
            const dayElement = document.querySelector(`[data-date="${date}"]`);
            if (dayElement) {
                dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                dayElement.classList.add('settings-research-highlighted');
                setTimeout(() => dayElement.classList.remove('settings-research-highlighted'), 2000);
                // Open the note modal if available
                if (window.openNoteModal) {
                    window.openNoteModal(noteDate, index);
                }
            }
        }, 100);
    }
    openTip(category, tipId) {
        if (window.showTipsModal) {
            window.showTipsModal(category, tipId);
        }
    }
    openAttachment(attachmentId) {
        // Implement attachment opening logic
        console.log('Opening attachment:', attachmentId);
        //  might want to show a preview or download the attachment
    }
}
// Initialize research manager
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creating ResearchManager');
    window.researchManager = new ResearchManager();
    const langSelectSettings = document.querySelector('#language-select-settings');
    if (langSelectSettings) {
        langSelectSettings.addEventListener('change', () => {
            if (window.researchManager) {
                window.researchManager.updateLanguageTexts();
            }
        });
    }
});