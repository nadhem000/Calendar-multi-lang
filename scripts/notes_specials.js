// notes_specials.js
function getTranslation(key, fallback) {
    try {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        for (const k of keys) {
            result = result[k];
            if (result === undefined) break;
        }
        return result !== undefined ? result : fallback;
    } catch (e) {
        return fallback;
    }
}
function showSpecialNotesModal() {
    const modal = document.createElement('div');
    modal.className = 'notes-specials-options-modal';
    
    // Get translations
    const generalizeText = getTranslation('Notesspecials.generalize', 'Generalize Note');
    const generalizeTooltip = getTranslation('Notesspecials.generalizeTooltip', 'Create repeating notes based on patterns');
    const editSpecialText = getTranslation('Notesspecials.editSpecial', 'Edit Special Note');
    const editSpecialTooltip = getTranslation('Notesspecials.editSpecialTooltip', 'Edit existing special notes');
    const deleteNotesText = getTranslation('Notesspecials.deleteNotes', 'Delete Notes');
    const deleteNotesTooltip = getTranslation('Notesspecials.deleteNotesTooltip', 'Delete single or multiple notes');
    const generalizeOptions = getTranslation('Notesspecials.generalizeOptions', 'Generalization Options');
    const firstNoteDate = getTranslation('Notesspecials.firstNoteDate', 'First note date');
    const repeatPattern = getTranslation('Notesspecials.repeatPattern', 'Repeat pattern');
    const includeWeekends = getTranslation('Notesspecials.includeWeekends', 'Include weekends');
    const durationLimit = getTranslation('Notesspecials.durationLimit', 'Duration limit');
    const dailyText = getTranslation('Notesspecials.daily', 'Daily');
    const weeklyText = getTranslation('Notesspecials.weekly', 'Weekly');
    const monthlyText = getTranslation('Notesspecials.monthly', 'Monthly');
    const yearlyText = getTranslation('Notesspecials.yearly', 'Yearly');
    const noneText = getTranslation('Notesspecials.none', 'None');
    const saturdayText = getTranslation('Notesspecials.saturday', 'Saturday');
    const sundayText = getTranslation('Notesspecials.sunday', 'Sunday');
    const bothText = getTranslation('Notesspecials.both', 'Both');
    const yearText = getTranslation('Notesspecials.year', 'year');
    const yearsText = getTranslation('Notesspecials.years', 'years');
    const customText = getTranslation('Notesspecials.custom', 'Custom');
    const confirmText = getTranslation('Notesspecials.confirm', 'Confirm');
    const closeText = getTranslation('close', 'Close');
    const editSpecialNotes = getTranslation('Notesspecials.editSpecialNotes', 'Edit Special Notes');
    const editText = getTranslation('edit', 'Edit');
    const deleteNotesOptions = getTranslation('Notesspecials.deleteNotesOptions', 'Delete Notes Options');
    const deleteSingle = getTranslation('Notesspecials.deleteSingle', 'Delete single note');
    const deleteAll = getTranslation('Notesspecials.deleteAll', 'Delete all notes');
    const confirmDelete = getTranslation('Notesspecials.confirmDelete', 'Confirm Delete');
    const notePlaceholder = getTranslation('notePlaceholder', 'Add your note here...');
    const noteSettingsText = getTranslation('noteSettings', 'Note Settings');
    const timeText = getTranslation('time', 'Time');

    modal.innerHTML = `
        <div class="notes-specials-options-content">
            <h3>${window.sanitizeHTML(getTranslation('Notesspecials.specialNotes', 'Special Notes'))}</h3>
            <div class="notes-specials-options-buttons">
                <button class="notes-specials-generalize" title="${window.sanitizeHTML(generalizeTooltip)}">
                    ${window.sanitizeHTML(generalizeText)}
                </button>
                <button class="notes-specials-edit" title="${window.sanitizeHTML(editSpecialTooltip)}">
                    ${window.sanitizeHTML(editSpecialText)}
                </button>
                <button class="notes-specials-delete" title="${window.sanitizeHTML(deleteNotesTooltip)}">
                    ${window.sanitizeHTML(deleteNotesText)}
                </button>
            </div>
            <div class="notes-specials-generalize-options hidden">
                <h4>${window.sanitizeHTML(generalizeOptions)}</h4>
                <fieldset class="note-controls">
                    <legend>${window.sanitizeHTML(noteSettingsText)}</legend>
                    <div class="color-picker">
                        ${window.noteColors.map((color, index) => `
                        <label class="color-option" style="background-color: ${color.color}" 
                            title="${color.class.replace('note-color-', '')}">
                            <input type="radio" name="note-color" value="${color.class}" ${index === 0 ? 'checked' : ''}>
                        </label>
                        `).join('')}
                    </div>
                    <div class="note-type-selector">
                        ${window.noteTypes.map((type, index) => `
                        <input type="radio" name="note-type" id="type-special-${index}" 
                            class="note-type" value="${type.type}" ${index === 0 ? 'checked' : ''}>
                        <label for="type-special-${index}" title="${type.label}">${type.icon}</label>
                        `).join('')}
                    </div>
                    <div class="notes-specials-time-input">
                        <label for="note-time-special">${window.sanitizeHTML(timeText)}:</label>
                        <input type="time" id="note-time-special" name="note-time" value="">
                    </div>
                </fieldset>
                <label for="notes-specials-options-input" title="${window.sanitizeHTML(notePlaceholder)}">
                    <input type="text" id="notes-specials-options-input" class="notes-specials-options-input"
                        name="note-content" placeholder="${window.sanitizeHTML(notePlaceholder)}">
                </label>
                <div class="notes-specials-options-grid">
                    <div>
                        <label for="notes-specials-date-input" title="${window.sanitizeHTML(firstNoteDate)}">
                            ${window.sanitizeHTML(firstNoteDate)}
                            <input type="date" id="notes-specials-date-input" name="first-note-date" class="notes-specials-date-input">
                        </label>
                    </div>
                    <div>
                        <label for="notes-specials-pattern-select" title="${window.sanitizeHTML(repeatPattern)}">
                            ${window.sanitizeHTML(repeatPattern)}
<select id="notes-specials-pattern-select" name="repeat-pattern" class="notes-specials-pattern-select">
    <option value="daily">${window.sanitizeHTML(dailyText)}</option>
    <option value="weekly">${window.sanitizeHTML(weeklyText)}</option>
    <option value="monthly">${window.sanitizeHTML(monthlyText)}</option>
    <option value="three_months">${window.sanitizeHTML('Every 3 Months')}</option>
    <option value="yearly">${window.sanitizeHTML(yearlyText)}</option>
</select>
                        </label>
                    </div>
                    <div>
                        <label for="notes-specials-weekends-select" title="${window.sanitizeHTML(includeWeekends)}">
                            ${window.sanitizeHTML(includeWeekends)}
                            <select id="notes-specials-weekends-select" name="include-weekends" class="notes-specials-weekends-select">
                                <option value="none">${window.sanitizeHTML(noneText)}</option>
                                <option value="saturday">${window.sanitizeHTML(saturdayText)}</option>
                                <option value="sunday">${window.sanitizeHTML(sundayText)}</option>
                                <option value="both">${window.sanitizeHTML(bothText)}</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label for="notes-specials-duration-select" title="${window.sanitizeHTML(durationLimit)}">
                            ${window.sanitizeHTML(durationLimit)}
                            <select id="notes-specials-duration-select" name="duration-limit" class="notes-specials-duration-select">
                                <option value="1">1 ${window.sanitizeHTML(yearText)}</option>
                                <option value="3">3 ${window.sanitizeHTML(yearsText)}</option>
                                <option value="5">5 ${window.sanitizeHTML(yearsText)}</option>
                                <option value="10">10 ${window.sanitizeHTML(yearsText)}</option>
                                <option value="custom">${window.sanitizeHTML(customText)}</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="notes-specials-actions">
                    <button class="notes-specials-confirm" title="${window.sanitizeHTML(confirmText)}">${window.sanitizeHTML(confirmText)}</button>
                    <button class="notes-specials-cancel" title="${window.sanitizeHTML(closeText)}">${window.sanitizeHTML(closeText)}</button>
                </div>
            </div>
            <div class="notes-specials-edit-options hidden">
                <h4>${window.sanitizeHTML(editSpecialNotes)}</h4>
                <div class="notes-specials-notes-list">
                    <!-- Notes will be populated here -->
                </div>
                <div class="notes-specials-actions">
                    <button class="notes-specials-close-edit" title="${window.sanitizeHTML(closeText)}">${window.sanitizeHTML(closeText)}</button>
                </div>
            </div>
            <div class="notes-specials-delete-options hidden">
                <h4>${window.sanitizeHTML(deleteNotesOptions)}</h4>
                <div class="notes-specials-delete-choices">
                    <label title="${window.sanitizeHTML(deleteSingle)}">
                        <input type="radio" id="delete-option-single" name="delete-option" value="single" checked>
                        ${window.sanitizeHTML(deleteSingle)}
                    </label>
                    <label title="${window.sanitizeHTML(deleteAll)}">
                        <input type="radio" id="delete-option-all" name="delete-option" value="all">
                        ${window.sanitizeHTML(deleteAll)}
                    </label>
                </div>
                <div class="notes-specials-actions">
                    <button class="notes-specials-confirm-delete" title="${window.sanitizeHTML(confirmDelete)}">${window.sanitizeHTML(confirmDelete)}</button>
                    <button class="notes-specials-cancel-delete" title="${window.sanitizeHTML(closeText)}">${window.sanitizeHTML(closeText)}</button>
                </div>
            </div>
            <button class="notes-specials-options-close" title="${window.sanitizeHTML(closeText)}">${window.sanitizeHTML(closeText)}</button>
        </div>
    `;

    // Event listeners
    modal.querySelector('.notes-specials-options-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Button handlers
    modal.querySelector('.notes-specials-generalize').addEventListener('click', () => {
        modal.querySelectorAll('.notes-specials-generalize-options, .notes-specials-edit-options, .notes-specials-delete-options')
            .forEach(div => div.classList.add('hidden'));
        modal.querySelector('.notes-specials-generalize-options').classList.remove('hidden');
        
        // Set default date to today
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        modal.querySelector('#notes-specials-date-input').value = dateStr;
    });
	// Initialize selections
const firstColor = modal.querySelector('.color-option');
if (firstColor) firstColor.classList.add('selected');
const firstType = modal.querySelector('.note-type');
if (firstType) firstType.classList.add('selected');
// Color picker interaction - same as regular notes
modal.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        modal.querySelectorAll('.color-option').forEach(opt => 
            opt.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Type selector interaction - same as regular notes
modal.querySelectorAll('.note-type').forEach(type => {
    type.addEventListener('click', function() {
        modal.querySelectorAll('.note-type').forEach(t => 
            t.classList.remove('selected'));
        this.classList.add('selected');
        
        // Auto-insert type text if empty
        const textarea = modal.querySelector('.notes-specials-options-input');
        if (!textarea.value.trim()) {
            const typeData = window.noteTypes.find(t => t.type === this.value);
            textarea.value = `${typeData.icon} ${typeData.label}`;
        }
    });
});

    modal.querySelector('.notes-specials-edit').addEventListener('click', () => {
        modal.querySelectorAll('.notes-specials-generalize-options, .notes-specials-edit-options, .notes-specials-delete-options')
            .forEach(div => div.classList.add('hidden'));
        modal.querySelector('.notes-specials-edit-options').classList.remove('hidden');
        
        // Populate notes list
        const notesList = modal.querySelector('.notes-specials-notes-list');
        notesList.innerHTML = '';
        
        // Find all special notes
        const specialNotes = [];
        for (const date in window.notes) {
            window.notes[date].forEach(note => {
                if (note.special) {
                    specialNotes.push({
                        date: date,
                        content: note.text,
                        color: note.color,
                        type: note.type
                    });
                }
            });
        }
        
        if (specialNotes.length === 0) {
            notesList.innerHTML = '<p>' + window.sanitizeHTML(getTranslation('Notesspecials.noSpecialNotes', 'No special notes found')) + '</p>';
            return;
        }
        
        specialNotes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = 'notes-specials-note-item';
    noteItem.innerHTML = `
        <span class="notes-specials-note-date">${note.date}</span>
        <span class="notes-specials-note-content">${window.sanitizeHTML(note.content)}</span>
        <button class="notes-specials-edit-note" title="${window.sanitizeHTML(editText)}">
            ${window.sanitizeHTML(editText)}
        </button>
    `;
    // Add click handler for the edit button
    noteItem.querySelector('.notes-specials-edit-note').addEventListener('click', () => {
        showEditSpecialNoteModal({
            date: note.date,
            content: note.content,
            color: note.color,
            type: note.type,
            time: note.time
        });
    });
    notesList.appendChild(noteItem);
});
    });

    modal.querySelector('.notes-specials-delete').addEventListener('click', () => {
    modal.querySelectorAll('.notes-specials-generalize-options, .notes-specials-edit-options, .notes-specials-delete-options')
        .forEach(div => div.classList.add('hidden'));
    modal.querySelector('.notes-specials-delete-options').classList.remove('hidden');
    
    // Populate notes list for single deletion
    const deleteChoices = modal.querySelector('.notes-specials-delete-choices');
    deleteChoices.innerHTML = `
        <label title="${window.sanitizeHTML(deleteSingle)}">
            <input type="radio" id="delete-option-single" name="delete-option" value="single" checked>
            ${window.sanitizeHTML(deleteSingle)}
        </label>
        <label title="${window.sanitizeHTML(deleteAll)}">
            <input type="radio" id="delete-option-all" name="delete-option" value="all">
            ${window.sanitizeHTML(deleteAll)}
        </label>
        <div class="notes-specials-delete-list hidden">
            <h5>${window.sanitizeHTML(getTranslation('Notesspecials.selectNoteToDelete', 'Select note to delete'))}</h5>
            <div class="notes-specials-notes-list">
                <!-- Notes will be populated here -->
            </div>
        </div>
    `;
    
    // Add event listener for radio buttons
    deleteChoices.querySelectorAll('input[name="delete-option"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const deleteList = deleteChoices.querySelector('.notes-specials-delete-list');
            if (e.target.value === 'single') {
                deleteList.classList.remove('hidden');
                populateDeleteNotesList(deleteList.querySelector('.notes-specials-notes-list'));
            } else {
                deleteList.classList.add('hidden');
            }
        });
    });
    
    // Initially populate if single is selected
    if (deleteChoices.querySelector('#delete-option-single').checked) {
        const deleteList = deleteChoices.querySelector('.notes-specials-delete-list');
        deleteList.classList.remove('hidden');
        populateDeleteNotesList(deleteList.querySelector('.notes-specials-notes-list'));
    }
});

    // Cancel/close handlers
    modal.querySelector('.notes-specials-cancel').addEventListener('click', () => {
        modal.querySelector('.notes-specials-generalize-options').classList.add('hidden');
    });

    modal.querySelector('.notes-specials-close-edit').addEventListener('click', () => {
        modal.querySelector('.notes-specials-edit-options').classList.add('hidden');
    });

    modal.querySelector('.notes-specials-cancel-delete').addEventListener('click', () => {
        modal.querySelector('.notes-specials-delete-options').classList.add('hidden');
    });

    // Confirm handler for creating notes
    modal.querySelector('.notes-specials-confirm').addEventListener('click', () => {
    const selectedColor = modal.querySelector('input[name="note-color"]:checked')?.value || 'note-color-gray';
    const selectedType = modal.querySelector('input[name="note-type"]:checked')?.value || 'note';
    const noteText = modal.querySelector('#notes-specials-options-input').value.trim();
    const noteTime = modal.querySelector('#note-time-special').value;
    const firstNoteDate = modal.querySelector('#notes-specials-date-input').value;
    const repeatPattern = modal.querySelector('#notes-specials-pattern-select').value;
    const includeWeekends = modal.querySelector('#notes-specials-weekends-select').value;
    const durationLimit = modal.querySelector('#notes-specials-duration-select').value;

    if (!noteText) {
        alert(getTranslation('validationError', 'Please enter note text'));
        return;
    }

    if (!firstNoteDate) {
        alert(getTranslation('validationDateError', 'Please select a start date'));
        return;
    }

    const dates = window.generateDates(firstNoteDate, repeatPattern, includeWeekends, durationLimit);
    
    dates.forEach(date => {
        const dateKey = window.normalizeDateKey(new Date(date));
        if (!window.notes[dateKey]) {
            window.notes[dateKey] = [];
        }
        
        window.notes[dateKey].push({
    date: dateKey,
    color: selectedColor,
    type: selectedType,
    text: noteText,
    time: noteTime,
    language: currentLanguage,
    special: true,  // This marks it as a special note
    pattern: repeatPattern,
    originalDate: firstNoteDate
});
    });

    saveNotes();
    modal.remove();
});

    // Confirm handler for deleting notes
    // Confirm handler for deleting notes
modal.querySelector('.notes-specials-confirm-delete').addEventListener('click', () => {
    const deleteOption = modal.querySelector('input[name="delete-option"]:checked')?.value;
    
    if (deleteOption === 'all') {
        if (confirm(getTranslation('Notesspecials.confirmDeleteAll', 'Are you sure you want to delete ALL special notes?'))) {
            // Delete all special notes
            for (const date in window.notes) {
                window.notes[date] = window.notes[date].filter(note => !note.special);
                if (window.notes[date].length === 0) {
                    delete window.notes[date];
                }
            }
            saveNotes();
            modal.remove();
        }
    } else if (deleteOption === 'single') {
        // Changed this line to look in the delete-list container
        const container = modal.querySelector('.notes-specials-delete-list .notes-specials-notes-list');
        const checkedBoxes = container.querySelectorAll('.notes-specials-note-checkbox:checked:not(#select-all-notes)');
        
        if (checkedBoxes.length === 0) {
            alert(getTranslation('Notesspecials.noNotesSelected', 'Please select at least one note to delete'));
            return;
        }
        
        if (confirm(getTranslation('Notesspecials.confirmDeleteSelected', `Are you sure you want to delete ${checkedBoxes.length} selected notes?`))) {
            // Delete selected notes
            checkedBoxes.forEach(checkbox => {
                const date = checkbox.dataset.date;
                const index = parseInt(checkbox.dataset.index);
                
                if (window.notes[date] && window.notes[date][index]) {
                    window.notes[date].splice(index, 1);
                    
                    if (window.notes[date].length === 0) {
                        delete window.notes[date];
                    }
                }
            });
            
            saveNotes();
            
            // Refresh the list
            populateDeleteNotesList(container);
        }
    }
});

    document.body.appendChild(modal);
}

function showEditSpecialNoteModal(noteData) {
    const modal = document.createElement('div');
    modal.className = 'notes-specials-edit-modal';
    modal.innerHTML = `
        <div class="notes-specials-edit-content">
            <h4>${window.sanitizeHTML(getTranslation('Notesspecials.editSpecialNote', 'Edit Special Note'))}</h4>
            <fieldset class="note-controls">
                <legend>${window.sanitizeHTML(getTranslation('noteSettings', 'Note Settings'))}</legend>
                <div class="color-picker">
                    ${window.noteColors.map((color) => `
                    <label class="color-option ${noteData.color === color.class ? 'selected' : ''}" 
                        style="background-color: ${color.color}" 
                        title="${color.class.replace('note-color-', '')}">
                        <input type="radio" name="edit-note-color" value="${color.class}" 
                            ${noteData.color === color.class ? 'checked' : ''}>
                    </label>
                    `).join('')}
                </div>
                <div class="note-type-selector">
                    ${window.noteTypes.map((type, index) => `
                    <input type="radio" name="edit-note-type" id="edit-type-${index}" 
                        class="note-type" value="${type.type}" 
                        ${noteData.type === type.type ? 'checked' : ''}>
                    <label for="edit-type-${index}" title="${type.label}">${type.icon}</label>
                    `).join('')}
                </div>
                <div class="notes-specials-time-input">
                    <label for="edit-note-time">${window.sanitizeHTML(getTranslation('time', 'Time'))}:</label>
                    <input type="time" id="edit-note-time" name="edit-note-time" value="${noteData.time || ''}">
                </div>
            </fieldset>
            <label>
                <textarea class="notes-specials-edit-input">${window.sanitizeHTML(noteData.content)}</textarea>
            </label>
            <div class="notes-specials-edit-actions">
                <button class="notes-specials-save-edit">${window.sanitizeHTML(getTranslation('save', 'Save'))}</button>
                <button class="notes-specials-cancel-edit">${window.sanitizeHTML(getTranslation('close', 'Close'))}</button>
            </div>
        </div>
    `;
    // Color picker interaction
    modal.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.color-option').forEach(opt => 
                opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    // Type selector interaction
    modal.querySelectorAll('.note-type').forEach(type => {
        type.addEventListener('click', function() {
            modal.querySelectorAll('.note-type').forEach(t => 
                t.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    // Save handler
    modal.querySelector('.notes-specials-save-edit').addEventListener('click', () => {
        const selectedColor = modal.querySelector('input[name="edit-note-color"]:checked')?.value || 'note-color-gray';
        const selectedType = modal.querySelector('input[name="edit-note-type"]:checked')?.value || 'note';
        const noteText = modal.querySelector('.notes-specials-edit-input').value.trim();
        const noteTime = modal.querySelector('#edit-note-time').value;
        if (!noteText) {
            alert(getTranslation('validationError', 'Please enter note text'));
            return;
        }
        // Update the note in the main notes object
        for (const date in window.notes) {
            window.notes[date].forEach(note => {
                if (note.special && note.text === noteData.content && note.date === noteData.date) {
                    note.text = noteText;
                    note.color = selectedColor;
                    note.type = selectedType;
                    note.time = noteTime;
                }
            });
        }
        saveNotes();
        modal.remove();
        // Refresh the edit view
        document.querySelector('.notes-specials-edit').click();
    });
    // Close handler
    modal.querySelector('.notes-specials-cancel-edit').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
}
function populateDeleteNotesList(container) {
    container.innerHTML = '';
    
    // Find all special notes
    const specialNotes = [];
    for (const date in window.notes) {
        window.notes[date].forEach((note, index) => {
            if (note.special) {
                specialNotes.push({
                    date: date,
                    content: note.text,
                    color: note.color,
                    type: note.type,
                    time: note.time,
                    noteIndex: index,
                    noteDate: date
                });
            }
        });
    }
    
    if (specialNotes.length === 0) {
        container.innerHTML = '<p>' + window.sanitizeHTML(getTranslation('Notesspecials.noSpecialNotes', 'No special notes found')) + '</p>';
        return;
    }
    
    // Create a select all checkbox
    const selectAllItem = document.createElement('div');
    selectAllItem.className = 'notes-specials-note-item select-all';
    selectAllItem.innerHTML = `
        <input type="checkbox" id="select-all-notes" class="notes-specials-note-checkbox">
        <label for="select-all-notes">${window.sanitizeHTML(getTranslation('Notesspecials.selectAll', 'Select All'))}</label>
    `;
    container.appendChild(selectAllItem);
    
    // Add click handler for select all
    selectAllItem.querySelector('#select-all-notes').addEventListener('change', function() {
        container.querySelectorAll('.notes-specials-note-checkbox:not(#select-all-notes)').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    specialNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'notes-specials-note-item';
        noteItem.innerHTML = `
            <input type="checkbox" id="note-${note.noteDate}-${note.noteIndex}" 
                   class="notes-specials-note-checkbox" data-date="${note.noteDate}" data-index="${note.noteIndex}">
            <span class="notes-specials-note-date">${note.date}</span>
            <span class="notes-specials-note-content">${window.sanitizeHTML(note.content)}</span>
        `;
        
        container.appendChild(noteItem);
    });
}
// Initialize the special notes icon
document.addEventListener('DOMContentLoaded', () => {
    const notesSpecialsIcon = document.getElementById('notes-specials-icon');
    if (notesSpecialsIcon) {
        notesSpecialsIcon.addEventListener('click', showSpecialNotesModal);
    }
});