// Notes functionality
window.notes = {};

/**
 * Opens a modal for adding/editing notes on a specific date
 * @param {Date} date - The date for the note
 * @param {HTMLElement} dayElement - The calendar day element
 */
function openNoteModal(date, dayElement) {
    // Remove any existing modals first
    document.querySelectorAll('.note-modal').forEach(modal => modal.remove());
    
    const modal = document.createElement('div');
    modal.className = 'note-modal';
    const dateKey = window.normalizeDateKey(date);
    const existingNotes = window.notes[dateKey] || [];
    
    // Build modal HTML with fallback English translations
    modal.innerHTML = `
        <div class="note-modal-content">
            <div class="note-header">
                <h3>${formatNoteDate(date)}</h3>
                <span class="close-modal" title="${translations[currentLanguage]?.close || 'Close'}">&times;</span>
            </div>
            <fieldset class="note-controls">
                <legend>${translations[currentLanguage]?.noteSettings || 'Note Settings'}</legend>
                <div class="color-picker">
                    ${window.noteColors.map((color, index) => `
                        <label class="color-option" 
                            style="background-color: ${color.color}" 
                            title="${color.class.replace('note-color-', '')}">
                            <input type="radio" 
                                name="note-color" 
                                value="${color.class}" 
                                ${index === 0 ? 'checked' : ''}>
                        </label>
                    `).join('')}
                </div>
                <div class="note-type-selector">
                    ${window.noteTypes.map((type, index) => `
                        <input type="radio" name="note-type" id="type-${dateKey}-${index}" 
                            class="note-type" value="${type.type}" ${index === 0 ? 'checked' : ''}>
                        <label for="type-${dateKey}-${index}" title="${type.label}">${type.icon}</label>
                    `).join('')}
                </div>
                <div class="time-input">
                    <label for="note-time-${dateKey}">${translations[currentLanguage]?.time || 'Time'}:</label>
                    <input type="time" id="note-time-${dateKey}" name="note-time" 
                        value="${existingNotes[0]?.time || ''}">
                </div>
            </fieldset>
            <label for="note-input" class="sr-only">${translations[currentLanguage]?.noteLabel || 'Note Content'}</label>
            <textarea id="note-input" name="note" class="note-text" 
                placeholder="${translations[currentLanguage]?.notePlaceholder || 'Add your note here...'}"></textarea>
            <div class="existing-notes">
                <h4>${translations[currentLanguage]?.existingNotes || 'Existing Notes'}:</h4>
                <div class="notes-list">
                    ${(window.notes[dateKey] || [])
                        .sort((a, b) => (a.time || '23:59') > (b.time || '23:59') ? 1 : -1)
                        .map((note, index) => `
                            <div class="note-item" style="background-color: ${
                                window.noteColors.find(c => c.class === note.color)?.color || '#cccccc'
                            }">
                                <div class="note-icon">${
                                    window.noteTypes.find(t => t.type === note.type)?.icon || '📝'
                                }</div>
                                <div class="note-content">
                                    ${note.time ? `<div class="note-time">${note.time}</div>` : ''}
                                    ${window.sanitizeHTML(note.text)}
                                    <div class="note-language">${note.language.toUpperCase()}</div>
                                </div>
                                <button class="edit-note" data-index="${index}" title="${translations[currentLanguage]?.edit || 'Edit'}">✎</button>
                                <button class="delete-note" data-index="${index}" title="${translations[currentLanguage]?.delete || 'Delete'}">✕</button>
                            </div>
                        `).join('')}
                </div>
            </div>
            <div class="note-buttons">
                <button type="submit" class="save-note">${translations[currentLanguage]?.save || 'Save'}</button>
                <button type="button" class="close-note">${translations[currentLanguage]?.close || 'Close'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize UI selections
    const firstColor = modal.querySelector('.color-option');
    if (firstColor) firstColor.classList.add('selected');
    const firstType = modal.querySelector('.note-type');
    if (firstType) firstType.classList.add('selected');
    
    // Set up color picker interaction
    modal.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.color-option').forEach(opt => 
                opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Set up type selector interaction
    modal.querySelectorAll('.note-type').forEach(type => {
        type.addEventListener('click', function() {
            modal.querySelectorAll('.note-type').forEach(t => 
                t.classList.remove('selected'));
            this.classList.add('selected');
            
            // Auto-insert type text if empty
            const textarea = modal.querySelector('.note-text');
            if (!textarea.value.trim()) {
                const typeData = window.noteTypes.find(t => t.type === this.value);
                textarea.value = `${typeData.icon} ${typeData.label}`;
            }
        });
    });
    
    // Delete note handler
    modal.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            if (confirm(translations[currentLanguage]?.confirmDelete || 'Are you sure you want to delete this note?')) {
                if (window.notes[dateKey] && window.notes[dateKey].length > index) {
                    window.notes[dateKey].splice(index, 1);
                    if (window.notes[dateKey].length === 0) {
                        delete window.notes[dateKey];
                    }
                    saveNotes();
                    renderCalendar(translations[currentLanguage]);
                    openNoteModal(date, dayElement);
                }
            }
        });
    });
    
    // Edit note handler
    modal.querySelectorAll('.edit-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            const note = window.notes[dateKey][index];
            
            // Update form values with selected note's data
            modal.querySelectorAll('.color-option').forEach(option => {
                const radio = option.querySelector('input');
                if (radio.value === note.color) {
                    radio.checked = true;
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
            
            modal.querySelectorAll('.note-type').forEach(radio => {
                if (radio.value === note.type) {
                    radio.checked = true;
                    radio.classList.add('selected');
                } else {
                    radio.classList.remove('selected');
                }
            });
            
            modal.querySelector('#note-input').value = note.text;
            modal.querySelector('input[name="note-time"]').value = note.time || '';
            modal.dataset.editIndex = index;
        });
    });
    
    // Save handler for new/edited notes
    modal.querySelector('.save-note').addEventListener('click', () => {
        const selectedColor = modal.querySelector('input[name="note-color"]:checked')?.value || 'note-color-gray';
        const selectedType = modal.querySelector('input[name="note-type"]:checked')?.value || 'note';
        const noteText = modal.querySelector('#note-input').value.trim();
        const noteTime = modal.querySelector('input[name="note-time"]').value;
        const dateKey = window.normalizeDateKey(date);
        
        if (!noteText) {
            alert(translations[currentLanguage]?.validationError || 'Please enter note text');
            return;
        }
        
        const editingIndex = modal.dataset.editIndex;
        if (!window.notes[dateKey]) window.notes[dateKey] = [];
        
        if (editingIndex !== undefined) {
            // Update existing note
            const index = parseInt(editingIndex);
            window.notes[dateKey][index] = {
                date: dateKey,
                color: selectedColor,
                type: selectedType,
                text: noteText,
                time: noteTime,
                language: currentLanguage,
                currentCalendarSystem: localStorage.getItem('calendarSystem') || 'gregorian'
            };
        } else {
            // Add new note
            window.notes[dateKey].push({
                date: dateKey,
                color: selectedColor,
                type: selectedType,
                text: noteText,
                time: noteTime,
                language: currentLanguage,
                currentCalendarSystem: localStorage.getItem('calendarSystem') || 'gregorian'
            });
        }
        
        saveNotes();
        renderCalendar(translations[currentLanguage]);
        modal.remove();
    });
    
    // Close handlers
    const closeModal = () => modal.remove();
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.close-note').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * Formats a date according to current language settings
 * @param {Date} date - The date to format
 * @return {string} Formatted date string
 */
function formatNoteDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
}

/**
 * Validates and sanitizes note data
 * @param {object} note - The note object to validate
 * @return {object} Validated note object
 */
function validateNote(note) {
    return {
        date: window.normalizeDateKey(note.date),
        color: window.noteColors.some(c => c.class === note.color) ? note.color : 'note-color-gray',
        type: window.noteTypes.some(t => t.type === note.type) ? note.type : 'note',
        text: window.sanitizeHTML(note.text),
        time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(note.time) ? note.time : '',
        language: ['en', 'fr', 'ar'].includes(note.language) ? note.language : 'en',
        currentCalendarSystem: ['gregorian', 'otherSystems'].includes(note.currentCalendarSystem) ? 
                              note.currentCalendarSystem : 'gregorian'
    };
}

/**
 * Renders a visual indicator for notes on calendar days
 * @param {HTMLElement} dayElement - The calendar day element
 * @param {string} colorClass - The CSS class for the note color
 */
function renderNoteIndicator(dayElement, colorClass) {
    // Clear existing indicators
    dayElement.querySelectorAll('.note-indicator').forEach(el => el.remove());
    
    // Add new indicator
    const indicator = document.createElement('div');
    indicator.className = 'note-indicator';
    
    // Find and apply the color
    const colorObj = window.noteColors.find(c => c.class === colorClass);
    indicator.style.backgroundColor = colorObj?.color || '#cccccc';
    
    // Add note count if notes exist
    const dateKey = window.normalizeDateKey(new Date(
        currentYear, 
        currentMonth, 
        parseInt(dayElement.textContent)
    ));
    const noteCount = window.notes[dateKey]?.length || 0;
    
    if (noteCount > 0) {
        indicator.textContent = noteCount > 9 ? '9+' : noteCount;
    }
    
    dayElement.appendChild(indicator);
}

/**
 * Loads notes from localStorage
 */
function loadNotes() {
    const loadingOverlay = showLoading();
    try {
        const saved = localStorage.getItem('calendarNotes');
        if (saved) {
            window.notes = JSON.parse(saved);
            
            // Ensure notes is always an object
            if (!window.notes || typeof window.notes !== 'object') {
                window.notes = {};
            }
            
            // Migrate old notes to include calendar system
            Object.keys(window.notes).forEach(dateKey => {
                if (window.notes[dateKey] && Array.isArray(window.notes[dateKey])) {
                    window.notes[dateKey] = window.notes[dateKey].map(note => ({
                        ...note,
                        currentCalendarSystem: note.currentCalendarSystem || 'gregorian'
                    }));
                }
            });
        } else {
            window.notes = {};
        }
    } catch (e) {
        console.error('Error loading notes:', e);
        window.notes = {};
    } finally {
        hideLoading(loadingOverlay);
    }
}

/**
 * Saves notes to localStorage
 */
function saveNotes() {
    // Migrate old note keys if needed
    const migratedNotes = {};
    let needsMigration = false;
    
    Object.keys(window.notes).forEach(key => {
        const newKey = window.normalizeDateKey(key);
        if (newKey !== key) {
            needsMigration = true;
        }
        
        // Ensure each note has calendar system info
        if (window.notes[key] && Array.isArray(window.notes[key])) {
            window.notes[key] = window.notes[key].map(note => {
                return {
                    ...note,
                    currentCalendarSystem: note.currentCalendarSystem || 
                                         localStorage.getItem('calendarSystem') || 
                                         'gregorian'
                };
            });
        }
        
        migratedNotes[newKey] = window.notes[key];
    });
    
    if (needsMigration) {
        window.notes = migratedNotes;
        console.log('Note date keys migrated to new format');
    }
    
    const loadingOverlay = showLoading();
    try {
        localStorage.setItem('calendarNotes', JSON.stringify(window.notes));
        if (window.appManager && window.appManager.updateWidget) {
            window.appManager.updateWidget();
        }
    } catch (e) {
        console.error('Error saving notes:', e);
    } finally {
        hideLoading(loadingOverlay);
    }
}

// Initialize note functionality
window.initNotes = function() {
    loadNotes();
    document.addEventListener('click', (e) => {
        const dayElement = e.target.closest('.days > div:not(.empty)');
        if (dayElement) {
            const day = parseInt(dayElement.textContent);
            const date = new Date(currentYear, currentMonth, day);
            openNoteModal(date, dayElement);
        }
    });
};