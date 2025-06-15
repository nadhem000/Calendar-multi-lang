// Helper function to get translations with fallback
function getTranslation(key, fallback) {
    try {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) break;
        }
        return result !== undefined ? result : fallback;
    } catch (e) {
        return fallback;
    }
}

// Update UI with translations
function updateExportImportUI() {
    // Update section titles
    document.querySelector('#export-import-tab h3').textContent = 
        getTranslation('importExport.exportData', 'Export Data');
    
    // Update export section
    const exportSection = document.querySelector('.settings-export-import-item:nth-child(1)');
    if (exportSection) {
        exportSection.querySelector('h4').textContent = 
            getTranslation('importExport.exportData', 'Export Data');
        exportSection.querySelector('p').textContent = 
            getTranslation('importExport.exportDescription', 'Export your calendar notes in various formats');
        
        if (exportJsonBtn) {
            exportJsonBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${
                getTranslation('importExport.exportAs', 'Export as')} JSON`;
        }
        if (exportCsvBtn) {
            exportCsvBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${
                getTranslation('importExport.exportAs', 'Export as')} CSV`;
        }
        if (exportTxtBtn) {
            exportTxtBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${
                getTranslation('importExport.exportAs', 'Export as')} TXT`;
        }
        if (exportIcalBtn) {
            exportIcalBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${
                getTranslation('importExport.exportAs', 'Export as')} iCal`;
        }
    }
    
    // Update import section
    const importSection = document.querySelector('.settings-export-import-item:nth-child(2)');
    if (importSection) {
        importSection.querySelector('h4').textContent = 
            getTranslation('importExport.importData', 'Import Data');
        importSection.querySelector('p').textContent = 
            getTranslation('importExport.importDescription', 'Import notes from a previously exported file');
        
        if (importBtn) {
            importBtn.innerHTML = `<span class="export-import-icon">⬆️</span> ${
                getTranslation('importExport.importData', 'Import Data')}`;
        }
    }
    
    // Update options
    if (importOverwrite) {
        importOverwrite.nextSibling.textContent = 
            getTranslation('importExport.overwriteExisting', 'Overwrite existing notes');
    }
    if (importMerge) {
        importMerge.nextSibling.textContent = 
            getTranslation('importExport.mergeExisting', 'Merge with existing notes');
    }
    if (importSpecialOnly) {
        importSpecialOnly.nextSibling.textContent = 
            getTranslation('importExport.importSpecialOnly', 'Import only special notes');
    }
    
    // Update status section
    const statusSection = document.querySelector('.settings-export-import-item:nth-child(3)');
    if (statusSection) {
        statusSection.querySelector('h4').textContent = 
            getTranslation('importExport.syncStatus', 'Sync Status');
        statusDisplay.textContent = 
            getTranslation('importExport.readyForOperations', 'Ready for export/import operations');
    }
    
    // Add tooltips
    addExportImportTooltips();
}

// Add tooltips to buttons
function addExportImportTooltips() {
    // Export buttons tooltips
    if (exportJsonBtn) {
        exportJsonBtn.setAttribute('data-tooltip', 
            getTranslation('importExport.exportJsonTooltip', 'Export notes in JSON format'));
    }
    if (exportCsvBtn) {
        exportCsvBtn.setAttribute('data-tooltip', 
            getTranslation('importExport.exportCsvTooltip', 'Export notes in CSV format'));
    }
    if (exportTxtBtn) {
        exportTxtBtn.setAttribute('data-tooltip', 
            getTranslation('importExport.exportTxtTooltip', 'Export notes in plain text format'));
    }
    if (exportIcalBtn) {
        exportIcalBtn.setAttribute('data-tooltip', 
            getTranslation('importExport.exportIcalTooltip', 'Export notes in iCalendar format'));
    }
    if (importBtn) {
        importBtn.setAttribute('data-tooltip', 
            getTranslation('importExport.importTooltip', 'Import notes from a file'));
    }
    if (importOverwrite) {
        importOverwrite.setAttribute('data-tooltip', 
            getTranslation('importExport.overwriteTooltip', 'Replace all existing notes with imported ones'));
    }
    if (importMerge) {
        importMerge.setAttribute('data-tooltip', 
            getTranslation('importExport.mergeTooltip', 'Add imported notes to existing ones'));
    }
    if (importSpecialOnly) {
        importSpecialOnly.setAttribute('data-tooltip', 
            getTranslation('importExport.importSpecialTooltip', 'Only import notes marked as special'));
    }
    
    // Initialize tooltip functionality
    initTooltips();
}

// Tooltip initialization
function initTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    
    elements.forEach(element => {
        // Remove existing event listeners to avoid duplicates
        element.removeEventListener('mouseenter', showTooltip);
        element.removeEventListener('mouseleave', hideTooltip);
        
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = this.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'export-import-tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    
    this.tooltip = tooltip;
}

function hideTooltip() {
    if (this.tooltip) {
        this.tooltip.remove();
        this.tooltip = null;
    }
}

function exportNotes(format) {
    statusDisplay.textContent = `${getTranslation('importExport.preparingExport', 'Preparing export')} ${format.toUpperCase()}...`;
    progressContainer?.classList.remove('hidden');
    
    try {
        // Get all notes data with additional metadata
        const notesData = {
            meta: {
                version: '1.1',
                exportedAt: new Date().toISOString(),
                totalNotes: 0,
                totalSpecialNotes: 0,
                language: currentLanguage,
                calendarSystem: localStorage.getItem('calendarSystem') || 'gregorian'
            },
            notes: {}
        };

        // Process notes and count totals
        for (const dateKey in window.notes) {
            notesData.notes[dateKey] = window.notes[dateKey].map(note => {
                // Sanitize note content
                const sanitizedNote = {
                    ...note,
                    text: window.sanitizeHTML(note.text)
                };
                
                // Count special notes
                if (note.special) {
                    notesData.meta.totalSpecialNotes++;
                }
                notesData.meta.totalNotes++;
                
                return sanitizedNote;
            });
        }

        let exportContent = '';
        let fileExtension = '';
        let mimeType = '';
        
        // Format the content based on the selected format
        if (format === 'json') {
            exportContent = JSON.stringify(notesData, null, 2);
            fileExtension = 'json';
            mimeType = 'application/json';
        } else if (format === 'csv') {
            exportContent = convertNotesToCSV(notesData.notes);
            fileExtension = 'csv';
            mimeType = 'text/csv';
        } else if (format === 'txt') {
            exportContent = convertNotesToText(notesData.notes);
            fileExtension = 'txt';
            mimeType = 'text/plain';
        } else if (format === 'ical') {
            exportContent = convertNotesToICal(notesData.notes);
            fileExtension = 'ical';
            mimeType = 'text/calendar';
        }
        
        // Create a blob with the content
        const blob = new Blob([exportContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-notes-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            statusDisplay.textContent = getTranslation('importExport.exportCompleted', 'Export completed');
            progressContainer?.classList.add('hidden');
        }, 100);
        
    } catch (error) {
        statusDisplay.textContent = `${getTranslation('importExport.exportFailed', 'Export failed')}: ${error.message}`;
        progressContainer?.classList.add('hidden');
        console.error('Export error:', error);
    }
}

function convertNotesToCSV(notesData) {
    let csvContent = `${getTranslation('importExport.date', 'Date')},${getTranslation('importExport.time', 'Time')},` +
                     `${getTranslation('importExport.type', 'Type')},${getTranslation('importExport.color', 'Color')},` +
                     `${getTranslation('importExport.language', 'Language')},${getTranslation('importExport.special', 'Special')},` +
                     `${getTranslation('importExport.content', 'Content')}\n`;
    
    Object.keys(notesData).forEach(date => {
        notesData[date].forEach(note => {
            csvContent += `"${date}","${note.time || ''}","${note.type}","${note.color}",` +
                          `"${note.language}","${note.special ? 'Yes' : 'No'}","${note.text.replace(/"/g, '""')}"\n`;
        });
    });
    
    return csvContent;
}

function convertNotesToText(notesData) {
    let textContent = `${getTranslation('importExport.calendarNotesExport', 'Calendar Notes Export')}\n`;
    textContent += `${getTranslation('importExport.generated', 'Generated')}: ${new Date().toLocaleString()}\n`;
    textContent += `${getTranslation('importExport.totalDates', 'Total dates')}: ${Object.keys(notesData).length}\n`;
    textContent += `${getTranslation('importExport.totalNotes', 'Total notes')}: ` + 
                   `${Object.values(notesData).reduce((sum, notes) => sum + notes.length, 0)}\n`;
    textContent += `${getTranslation('importExport.totalSpecialNotes', 'Total special notes')}: ` + 
                   `${Object.values(notesData).reduce((sum, notes) => sum + notes.filter(n => n.special).length, 0)}\n\n`;
    
    textContent += `=== ${getTranslation('importExport.notesByDate', 'Notes by date')} ===\n\n`;
    
    Object.keys(notesData).sort().forEach(date => {
        textContent += `${getTranslation('importExport.date', 'Date')}: ${date}\n`;
        textContent += `${getTranslation('importExport.notesCount', 'Notes count')}: ${notesData[date].length}\n`;
        textContent += `------------------------\n`;
        
        notesData[date].forEach((note, index) => {
            textContent += `${getTranslation('importExport.note', 'Note')} #${index + 1}:\n`;
            textContent += `- ${getTranslation('importExport.type', 'Type')}: ${note.type}\n`;
            if (note.time) textContent += `- ${getTranslation('importExport.time', 'Time')}: ${note.time}\n`;
            textContent += `- ${getTranslation('importExport.color', 'Color')}: ${note.color.replace('note-color-', '')}\n`;
            textContent += `- ${getTranslation('importExport.language', 'Language')}: ${note.language.toUpperCase()}\n`;
            textContent += `- ${getTranslation('importExport.special', 'Special')}: ${note.special ? 'Yes' : 'No'}\n`;
            if (note.special) {
                textContent += `- ${getTranslation('importExport.pattern', 'Pattern')}: ${note.pattern || 'N/A'}\n`;
            }
            textContent += `- ${getTranslation('importExport.content', 'Content')}:\n${note.text}\n\n`;
        });
        
        textContent += `\n`; // Extra space between dates
    });
    
    return textContent;
}

function convertNotesToICal(notesData) {
    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Calendar Notes//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    // Process each note and create a VEVENT
    Object.keys(notesData).forEach(date => {
        notesData[date].forEach((note, index) => {
            const uid = `${date.replace(/-/g, '')}${index}@calendarnotes`;
            const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const dtStart = `${date.replace(/-/g, '')}`;
            const summary = note.text.replace(/\n/g, '\\n').replace(/[,;]/g, '');
            const description = `Type: ${note.type}\\nColor: ${note.color}\\nLanguage: ${note.language}`;
            
            icalContent += [
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${dtStamp}`,
                `DTSTART;VALUE=DATE:${dtStart}`,
                `SUMMARY:${summary}`,
                `DESCRIPTION:${description}`,
                note.time ? `DTSTART;VALUE=DATE-TIME:${dtStart}T${note.time.replace(':', '')}00` : '',
                `CATEGORIES:${note.special ? 'SPECIAL' : 'NOTE'}`,
                'END:VEVENT'
            ].filter(line => line).join('\r\n') + '\r\n';
        });
    });

    icalContent += 'END:VCALENDAR\r\n';
    return icalContent;
}

function importNotes(data) {
    let importedCount = 0;
    let skippedCount = 0;
    let specialNotesCount = 0;
    
    try {
        // Check if we should import only special notes
        const importOnlySpecial = importSpecialOnly?.checked;
        
        // Validate the imported data structure
        if (typeof data !== 'object' || Array.isArray(data)) {
            throw new Error(getTranslation('importExport.invalidDataFormat', 'Invalid data format'));
        }
        
        // Handle both old format (direct notes object) and new format (with meta)
        const notesToImport = data.notes || data;
        
        // Check if we should overwrite or merge
        const overwrite = importOverwrite?.checked;
        const merge = importMerge?.checked;
        
        if (overwrite) {
            // Only clear non-special notes if importing only special notes
            if (importOnlySpecial) {
                for (const date in window.notes) {
                    window.notes[date] = window.notes[date].filter(note => note.special);
                    if (window.notes[date].length === 0) {
                        delete window.notes[date];
                    }
                }
            } else {
                window.notes = {};
            }
        } else if (!merge) {
            throw new Error(getTranslation('importExport.noImportOptionSelected', 'Please select an import option'));
        }
        
        // Process each date in the imported data
        Object.keys(notesToImport).forEach(dateKey => {
            if (!Array.isArray(notesToImport[dateKey])) {
                skippedCount++;
                return;
            }
            
            // Process each note for the date
            notesToImport[dateKey].forEach(note => {
                try {
                    // Skip if importing only special notes and this isn't one
                    if (importOnlySpecial && !note.special) {
                        skippedCount++;
                        return;
                    }
                    
                    // Validate the note structure
                    if (!note.text || typeof note.text !== 'string') {
                        skippedCount++;
                        return;
                    }
                    
                    // Sanitize HTML content
                    note.text = window.sanitizeHTML(note.text);
                    
                    // Normalize the date key
                    const normalizedDate = window.normalizeDateKey(dateKey);
                    
                    // Initialize the date array if it doesn't exist
                    if (!window.notes[normalizedDate]) {
                        window.notes[normalizedDate] = [];
                    }
                    
                    // Count special notes
                    if (note.special) {
                        specialNotesCount++;
                    }
                    
                    // Add the note with validated properties
                    window.notes[normalizedDate].push({
                        date: normalizedDate,
                        color: note.color || 'note-color-gray',
                        type: note.type || 'note',
                        text: note.text,
                        time: note.time || '',
                        language: note.language || 'en',
                        special: note.special || false,
                        pattern: note.pattern || '',
                        originalDate: note.originalDate || '',
                        currentCalendarSystem: note.currentCalendarSystem || localStorage.getItem('calendarSystem') || 'gregorian'
                    });
                    
                    importedCount++;
                } catch (e) {
                    skippedCount++;
                    console.warn(getTranslation('importExport.failedToImportNote', 'Failed to import note'), e);
                }
            });
        });
        
        // Save the imported notes
        saveNotes();
        
        // Update the display
        let statusMessage = getTranslation('importExport.importComplete', 
            'Import complete: {importedCount} notes imported ({specialNotesCount} special), {skippedCount} skipped')
            .replace('{importedCount}', importedCount)
            .replace('{specialNotesCount}', specialNotesCount)
            .replace('{skippedCount}', skippedCount);
        
        statusDisplay.textContent = statusMessage;
        progressContainer?.classList.add('hidden');
        
        // Refresh the calendar to show imported notes
        if (typeof renderCalendar === 'function') {
            renderCalendar(translations[window.currentLanguage]);
        }
        
    } catch (error) {
        statusDisplay.textContent = `${getTranslation('importExport.importFailed', 'Import failed')}: ${error.message}`;
        progressContainer?.classList.add('hidden');
        console.error('Import error:', error);
    }
}

function updateProgress(percent) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
}

// Global variables
let exportJsonBtn, exportCsvBtn, exportTxtBtn, exportIcalBtn, importFile, importBtn, statusDisplay;
let progressContainer, progressBar, progressText, importOverwrite, importMerge, importSpecialOnly;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize global variables
    exportJsonBtn = document.getElementById('export-json-btn');
    exportCsvBtn = document.getElementById('export-csv-btn');
    exportTxtBtn = document.getElementById('export-txt-btn');
    exportIcalBtn = document.getElementById('export-ical-btn');
    importFile = document.getElementById('import-file');
    importBtn = document.getElementById('import-btn');
    statusDisplay = document.getElementById('export-import-status');
    progressContainer = document.getElementById('export-import-progress');
    progressBar = progressContainer?.querySelector('.settings-export-import-progress-bar');
    progressText = progressContainer?.querySelector('.settings-export-import-progress-text');
    importOverwrite = document.getElementById('import-overwrite');
    importMerge = document.getElementById('import-merge');
    importSpecialOnly = document.getElementById('import-special-only');
    
    // Enable import button when file is selected
    if (importFile) {
        importFile.addEventListener('change', function() {
            if (importBtn) importBtn.disabled = !this.files.length;
        });
    }
    
    // Export as JSON
    exportJsonBtn?.addEventListener('click', function() {
        exportNotes('json');
    });
    
    // Export as CSV
    exportCsvBtn?.addEventListener('click', function() {
        exportNotes('csv');
    });
    
    // Export as TXT
    exportTxtBtn?.addEventListener('click', function() {
        exportNotes('txt');
    });
    
    // Export as iCal
    exportIcalBtn?.addEventListener('click', function() {
        exportNotes('ical');
    });
    
    // Import data
    importBtn?.addEventListener('click', function() {
        const file = importFile.files[0];
        if (!file) return;
        
        statusDisplay.textContent = `${getTranslation('importExport.importing', 'Importing')} ${file.name}...`;
        progressContainer?.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Try to parse as JSON first
                try {
                    const data = JSON.parse(e.target.result);
                    if (data && typeof data === 'object') {
                        importNotes(data);
                        return;
                    }
                } catch (jsonError) {
                    // Not JSON, try as iCal
                    if (file.name.endsWith('.ical')) {
                        const icalData = parseICalFile(e.target.result);
                        if (icalData) {
                            importNotes(icalData);
                            return;
                        }
                    }
                    throw new Error(getTranslation('importExport.invalidFileFormat', 'Invalid file format'));
                }
                
                throw new Error(getTranslation('importExport.invalidFileFormat', 'Invalid file format'));
            } catch (error) {
                statusDisplay.textContent = `${getTranslation('importExport.importFailed', 'Import failed')}: ${error.message}`;
                progressContainer?.classList.add('hidden');
            }
        };
        reader.onerror = () => {
            statusDisplay.textContent = getTranslation('importExport.fileReadError', 'Error reading file');
            progressContainer?.classList.add('hidden');
        };
        reader.readAsText(file);
    });
    
    // Initialize the UI when language changes
    document.addEventListener('languageChanged', updateExportImportUI);
    
    // Initial UI setup
    updateExportImportUI();
});

function parseICalFile(icalContent) {
    const lines = icalContent.split('\n');
    const notes = {};
    let currentEvent = null;
    
    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent) {
                // Process the event into a note
                const dateStr = currentEvent.DTSTART?.replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
                if (dateStr) {
                    if (!notes[dateStr]) {
                        notes[dateStr] = [];
                    }
                    
                    const descriptionParts = (currentEvent.DESCRIPTION || '').split('\\n');
                    const typeMatch = descriptionParts.find(p => p.startsWith('Type: '));
                    const colorMatch = descriptionParts.find(p => p.startsWith('Color: '));
                    const languageMatch = descriptionParts.find(p => p.startsWith('Language: '));
                    
                    notes[dateStr].push({
                        text: currentEvent.SUMMARY || '',
                        type: typeMatch ? typeMatch.replace('Type: ', '') : 'note',
                        color: colorMatch ? colorMatch.replace('Color: ', '') : 'note-color-gray',
                        language: languageMatch ? languageMatch.replace('Language: ', '') : 'en',
                        time: currentEvent.DTSTART?.includes('T') ? 
                             currentEvent.DTSTART.split('T')[1].substring(0, 4).match(/.{1,2}/g).join(':') : '',
                        special: currentEvent.CATEGORIES === 'SPECIAL'
                    });
                }
            }
            currentEvent = null;
        } else if (currentEvent) {
            const [key, value] = line.split(':');
            if (key && value !== undefined) {
                currentEvent[key] = value;
            }
        }
    }
    
    return { notes };
}