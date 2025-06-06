class ResearchManager {
    constructor() {
        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initResearchTab();
            this.updateLanguageTexts(); // Initial language update
        });
    }

    initResearchTab() {
        // Set up event listeners for research buttons
        document.querySelector('.settings-research-general-btn')?.addEventListener('click', () => {
            this.showGeneralResearch();
        });

        document.querySelector('.settings-research-date-btn')?.addEventListener('click', () => {
            this.showDateResearch();
        });

        document.querySelector('.settings-research-note-btn')?.addEventListener('click', () => {
            this.showNoteResearch();
        });
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
        if (document.getElementById('research-general-view')?.classList.contains('hidden') === false) {
            this.showGeneralResearch();
        }
        if (document.getElementById('research-date-view')?.classList.contains('hidden') === false) {
            this.showDateResearch();
        }
        if (document.getElementById('research-note-view')?.classList.contains('hidden') === false) {
            this.showNoteResearch();
        }
    }
    
    showGeneralResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('research-general-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.generalResearch || 'General Research'}</h4>
                <p>${lang.generalResearchDesc || 'This will contain general search functionality across all data.'}</p>
                <div class="settings-research-placeholder">
                    <input type="text" class="settings-research-input" placeholder="${lang.searchEverything || 'Search everything...'}">
                    <button class="settings-research-action-btn">${lang.search || 'Search'}</button>
                </div>
            </div>
        `;
        view.classList.remove('hidden');
    }

    showDateResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('research-date-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.dateResearch || 'Date Research'}</h4>
                <p>${lang.dateResearchDesc || 'This will contain date-specific search functionality.'}</p>
                <div class="settings-research-placeholder">
                    <input type="date" class="settings-research-input">
                    <button class="settings-research-action-btn">${lang.findDates || 'Find Dates'}</button>
                </div>
            </div>
        `;
        view.classList.remove('hidden');
    }

    showNoteResearch() {
        const lang = translations[currentLanguage];
        const view = document.getElementById('research-note-view');
        view.innerHTML = `
            <div class="settings-research-content">
                <h4>${lang.noteResearch || 'Note Research'}</h4>
                <p>${lang.noteResearchDesc || 'This will contain note content search functionality.'}</p>
                <div class="settings-research-placeholder">
                    <input type="text" class="settings-research-input" placeholder="${lang.searchNotes || 'Search notes...'}">
                    <button class="settings-research-action-btn">${lang.searchNotes || 'Search Notes'}</button>
                </div>
            </div>
        `;
        view.classList.remove('hidden');
    }
}

// Initialize research manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.researchManager = new ResearchManager();
    
    // Listen for language changes
    const langSelectSettings = document.querySelector('#language-select-settings');
    if (langSelectSettings) {
        langSelectSettings.addEventListener('change', () => {
            if (window.researchManager) {
                window.researchManager.updateLanguageTexts();
            }
        });
    }
});