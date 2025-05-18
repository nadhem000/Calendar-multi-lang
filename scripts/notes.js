// Notes functionality
window.notes = {};

// Color options for notes
const noteColors = [
    {class: 'note-color-gray', color: '#cccccc'},
    {class: 'note-color-red', color: '#ff6b6b'},
    {class: 'note-color-blue', color: '#48dbfb'},
    {class: 'note-color-green', color: '#1dd1a1'},
    {class: 'note-color-yellow', color: '#feca57'},
    {class: 'note-color-purple', color: '#5f27cd'}
];

// Updated note types with emoji icons
const noteTypes = [
    {icon: '📝', type: 'note', label: 'Note'},
    {icon: '🎂', type: 'birthday', label: 'Birthday'},
    {icon: '🏥', type: 'medical', label: 'Medical'},
    {icon: '📅', type: 'event', label: 'Event'}
];

function openNoteModal(date, dayElement) {
    // Remove any existing modals first
    document.querySelectorAll('.note-modal').forEach(modal => modal.remove());
    const modal = document.createElement('div');
    modal.className = 'note-modal';
    const dateKey = date.toISOString().split('T')[0];
    const existingNotes = window.notes[dateKey] || [];
    
    modal.innerHTML = `
    <div class="note-modal-content">
	<div class="note-header">
	<h3>${formatNoteDate(date)}</h3>
	<span class="close-modal" title="${translations[currentLanguage].close}">&times;</span>
	</div>
	
	<fieldset class="note-controls">
	<legend>${translations[currentLanguage].noteSettings || 'Note Settings'}</legend>
	
	<div class="color-picker">
    ${noteColors.map((color, index) => `
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
	${noteTypes.map((type, index) => `
	<input type="radio" name="note-type" id="type-${dateKey}-${index}" 
	class="note-type" value="${type.type}" ${index === 0 ? 'checked' : ''}>
	<label for="type-${dateKey}-${index}" title="${type.label}">${type.icon}</label>
	`).join('')}
	</div>
	</fieldset>
	
	<label for="note-input" class="sr-only">${translations[currentLanguage].noteLabel || 'Note Content'}</label>
	<textarea id="note-input" name="note" class="note-text" 
	placeholder="${translations[currentLanguage].notePlaceholder}"></textarea>
	
	<div class="existing-notes">
	<h4>${translations[currentLanguage].existingNotes || 'Existing Notes'}:</h4>
	<div class="notes-list">
    ${(window.notes[dateKey] || []).map((note, index) => `
    <div class="note-item" style="background-color: ${
	noteColors.find(c => c.class === note.color)?.color || '#cccccc'
}">
<div class="note-icon">${
	noteTypes.find(t => t.type === note.type)?.icon || '📝'
}</div>
<div class="note-content">
${note.text}
<div class="note-language">${note.language.toUpperCase()}</div>
</div>
<button class="delete-note" data-index="${index}" title="${
translations[currentLanguage].delete
}">✕</button>
</div>
`).join('')}
</div>
</div>

<div class="note-buttons">
<button type="submit" class="save-note">${translations[currentLanguage].save}</button>
<button type="button" class="close-note">${translations[currentLanguage].close}</button>
</div>
</div>
`;

document.body.appendChild(modal);

// Initialize selections
const firstColor = modal.querySelector('.color-option');
if (firstColor) firstColor.classList.add('selected');

const firstType = modal.querySelector('.note-type');
if (firstType) firstType.classList.add('selected');

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
		
		// Auto-insert type text if empty
		const textarea = modal.querySelector('.note-text');
		if (!textarea.value.trim()) {
			const typeData = noteTypes.find(t => t.type === this.value);
			textarea.value = `${typeData.icon} ${typeData.label}`;
		}
	});
});

// Delete note handler

modal.querySelectorAll('.delete-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
		e.stopPropagation();
		const index = parseInt(btn.dataset.index);
		if (confirm(translations[currentLanguage].confirmDelete)) {
			if (window.notes[dateKey] && window.notes[dateKey].length > index) {
				// Remove the note from all languages
				window.notes[dateKey].splice(index, 1);
				
				if (window.notes[dateKey].length === 0) {
					delete window.notes[dateKey];
				}
				
				saveNotes();
				
				// Refresh both calendar and modal
				renderCalendar(translations[currentLanguage]);
				openNoteModal(date, dayElement);
			}
		}
	});
});

// Save handler
modal.querySelector('.save-note').addEventListener('click', () => {
    const selectedColor = modal.querySelector('input[name="note-color"]:checked')?.value || 'note-color-gray';
    const selectedType = modal.querySelector('input[name="note-type"]:checked')?.value || 'note';
    const noteText = modal.querySelector('#note-input').value.trim();
    
    if (!noteText) {
        alert(translations[currentLanguage].validationError);
        return;
	}
	
    const dateKey = date.toISOString().split('T')[0];
    if (!window.notes[dateKey]) window.notes[dateKey] = [];
    
    window.notes[dateKey].push({
		date: dateKey,
		color: selectedColor,
		type: selectedType,
		text: noteText,
		language: currentLanguage // This maintains the original language context
	});
    
    saveNotes();
    renderCalendar(translations[currentLanguage]);
    modal.remove();
});

// Close handlers
const closeModal = () => modal.remove();
modal.querySelector('.close-modal').addEventListener('click', closeModal);
modal.querySelector('.close-note').addEventListener('click', closeModal);

// Close when clicking outside
modal.addEventListener('click', (e) => {
	if (e.target === modal) closeModal();
});
}

function formatNoteDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
	};
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
}

function saveNote(date, modal, dayElement) {
	const existingNotes = window.notes[dateKey]?.filter(note => 
		note.language === currentLanguage
	) || [];
    const selectedColor = modal.querySelector('.color-option.selected')?.dataset.color || 'note-color-gray';
    const selectedType = modal.querySelector('.note-type.selected')?.dataset.type || 'note';
    const noteText = modal.querySelector('.note-text').value.trim();
    
    if (!noteText) {
        alert(translations[currentLanguage].validationError || "Please enter note text");
        return;
	}
	
    const dateKey = date.toISOString().split('T')[0];
    if (!window.notes[dateKey]) window.notes[dateKey] = [];
    
    window.notes[dateKey] = [
		...existingNotes,
		{
			date: dateKey,
			color: selectedColor,
			type: selectedType,
			text: noteText,
			language: currentLanguage
		}
	];
    
    saveNotes();
    renderCalendar(translations[currentLanguage]);
}

// Modify getNoteForDate to filter by current language:
function getNoteForDate(date) {
    const dateKey = date.toISOString().split('T')[0];
    if (!window.notes[dateKey]) return null;
    return window.notes[dateKey].filter(note => !note.language || note.language === currentLanguage);
}
function renderNoteIndicator(dayElement, colorClass) {
    // Clear existing indicators
    dayElement.querySelectorAll('.note-indicator').forEach(el => el.remove());
    
    // Add new indicator
    const indicator = document.createElement('div');
    indicator.className = 'note-indicator';
    
    // Find the color in our noteColors array
    const colorObj = noteColors.find(c => c.class === colorClass);
    if (colorObj) {
        indicator.style.backgroundColor = colorObj.color;
		} else {
        // Default to gray if color not found
        indicator.style.backgroundColor = '#cccccc';
	}
    
    // Add note count
    const dateKey = new Date(
        currentYear, 
        currentMonth, 
        parseInt(dayElement.textContent)
	).toISOString().split('T')[0];
    
    const noteCount = window.notes[dateKey]?.length || 0;
    if (noteCount > 0) {
        indicator.textContent = noteCount > 9 ? '9+' : noteCount;
	}
    
    dayElement.appendChild(indicator);
}
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
function saveNotes() {
    const loadingOverlay = showLoading();
    try {
        localStorage.setItem('calendarNotes', JSON.stringify(window.notes));
		} catch (e) {
        console.error('Error saving notes:', e);
		} finally {
        hideLoading(loadingOverlay);
	}
}
function deleteNote(date) {
    const dateKey = date.toISOString().split('T')[0];
    if (window.notes[dateKey]) {
        delete window.notes[dateKey];
        saveNotes();
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