document.addEventListener('DOMContentLoaded', function() {
    // Export/Import Tab Functionality
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportTxtBtn = document.getElementById('export-txt-btn');
    const importFile = document.getElementById('import-file');
    const importBtn = document.getElementById('import-btn');
    const statusDisplay = document.getElementById('export-import-status');
    const progressContainer = document.getElementById('export-import-progress');
    const progressBar = progressContainer.querySelector('.settings-export-import-progress-bar');
    const progressText = progressContainer.querySelector('.settings-export-import-progress-text');
    const importOverwrite = document.getElementById('import-overwrite');
    const importMerge = document.getElementById('import-merge');
    
    // Update UI with translations
    function updateExportImportUI() {
        const langData = translations[currentLanguage].importExport;
        
        // Update section titles
        document.querySelector('#export-import-tab h3').textContent = langData.exportData;
        
        // Update export section
        const exportSection = document.querySelector('.settings-export-import-item:nth-child(1)');
        exportSection.querySelector('h4').textContent = langData.exportData;
        exportSection.querySelector('p').textContent = langData.exportDescription;
        
        exportJsonBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${langData.exportAs} JSON`;
        exportCsvBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${langData.exportAs} CSV`;
        exportTxtBtn.innerHTML = `<span class="export-import-icon">⬇️</span> ${langData.exportAs} TXT`;
        
        // Update import section
        const importSection = document.querySelector('.settings-export-import-item:nth-child(2)');
        importSection.querySelector('h4').textContent = langData.importData;
        importSection.querySelector('p').textContent = langData.importDescription;
        importBtn.innerHTML = `<span class="export-import-icon">⬆️</span> ${langData.importData}`;
        
        // Update options
        importOverwrite.nextSibling.textContent = langData.overwriteExisting;
        importMerge.nextSibling.textContent = langData.mergeExisting;
        
        // Update status section
        document.querySelector('.settings-export-import-item:nth-child(3) h4').textContent = langData.syncStatus;
        statusDisplay.textContent = langData.readyForOperations || 'Ready for export/import operations';
        
        // Add tooltips
        addExportImportTooltips();
    }
    
    // Add tooltips to buttons
    function addExportImportTooltips() {
        const langData = translations[currentLanguage].importExport;
        
        // Export buttons tooltips
        exportJsonBtn.setAttribute('data-tooltip', langData.exportJsonTooltip);
        exportCsvBtn.setAttribute('data-tooltip', langData.exportCsvTooltip);
        exportTxtBtn.setAttribute('data-tooltip', langData.exportTxtTooltip);
        importBtn.setAttribute('data-tooltip', langData.importTooltip);
        importOverwrite.setAttribute('data-tooltip', langData.overwriteTooltip);
        importMerge.setAttribute('data-tooltip', langData.mergeTooltip);
        
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
    
    // Enable import button when file is selected
    importFile.addEventListener('change', function() {
        importBtn.disabled = !this.files.length;
    });
    
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
    
    // Import data
    importBtn?.addEventListener('click', function() {
        const file = importFile.files[0];
        if (!file) return;
        
        const langData = translations[currentLanguage].importExport;
        statusDisplay.textContent = `${langData.importing} ${file.name}...`;
        progressContainer.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data && typeof data === 'object') {
                    importNotes(data);
                } else {
                    throw new Error(langData.invalidFileFormat);
                }
            } catch (error) {
                statusDisplay.textContent = `${langData.importFailed}: ${error.message}`;
                progressContainer.classList.add('hidden');
            }
        };
        reader.onerror = () => {
            statusDisplay.textContent = langData.fileReadError || 'Error reading file';
            progressContainer.classList.add('hidden');
        };
        reader.readAsText(file);
    });
    
    function exportNotes(format) {
        const langData = translations[currentLanguage].importExport;
        statusDisplay.textContent = `${langData.preparingExport} ${format.toUpperCase()}...`;
        progressContainer.classList.remove('hidden');
        
        try {
            // Get all notes data
            const notesData = window.notes || {};
            const dateKeys = Object.keys(notesData).sort();
            
            let exportContent = '';
            let fileExtension = '';
            let mimeType = '';
            
            // Format the content based on the selected format
            if (format === 'json') {
                exportContent = JSON.stringify(notesData, null, 2);
                fileExtension = 'json';
                mimeType = 'application/json';
            } else if (format === 'csv') {
                exportContent = convertNotesToCSV(notesData);
                fileExtension = 'csv';
                mimeType = 'text/csv';
            } else if (format === 'txt') {
                exportContent = convertNotesToText(notesData);
                fileExtension = 'txt';
                mimeType = 'text/plain';
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
                
                statusDisplay.textContent = langData.exportCompleted;
                progressContainer.classList.add('hidden');
            }, 100);
            
        } catch (error) {
            statusDisplay.textContent = `${langData.exportFailed}: ${error.message}`;
            progressContainer.classList.add('hidden');
            console.error('Export error:', error);
        }
    }
    
    function convertNotesToCSV(notesData) {
        const langData = translations[currentLanguage].importExport;
        let csvContent = `${langData.date},${langData.time},${langData.type},${langData.color},${langData.language},${langData.content}\n`;
        
        Object.keys(notesData).forEach(date => {
            notesData[date].forEach(note => {
                csvContent += `"${date}","${note.time || ''}","${note.type}","${note.color}",` +
                              `"${note.language}","${note.text.replace(/"/g, '""')}"\n`;
            });
        });
        
        return csvContent;
    }
    
    function convertNotesToText(notesData) {
        const langData = translations[currentLanguage].importExport;
        let textContent = `${langData.calendarNotesExport}\n`;
        textContent += `${langData.generated}: ${new Date().toLocaleString()}\n`;
        textContent += `${langData.totalDates}: ${Object.keys(notesData).length}\n`;
        textContent += `${langData.totalNotes}: ${Object.values(notesData).reduce((sum, notes) => sum + notes.length, 0)}\n\n`;
        
        textContent += `=== ${langData.notesByDate} ===\n\n`;
        
        Object.keys(notesData).sort().forEach(date => {
            textContent += `${langData.date}: ${date}\n`;
            textContent += `${langData.notesCount}: ${notesData[date].length}\n`;
            textContent += `------------------------\n`;
            
            notesData[date].forEach((note, index) => {
                textContent += `${langData.note} #${index + 1}:\n`;
                textContent += `- ${langData.type}: ${note.type}\n`;
                if (note.time) textContent += `- ${langData.time}: ${note.time}\n`;
                textContent += `- ${langData.color}: ${note.color.replace('note-color-', '')}\n`;
                textContent += `- ${langData.language}: ${note.language.toUpperCase()}\n`;
                textContent += `- ${langData.content}:\n${note.text}\n\n`;
            });
            
            textContent += `\n`; // Extra space between dates
        });
        
        return textContent;
    }
    
    function importNotes(data) {
        const langData = translations[currentLanguage].importExport;
        let importedCount = 0;
        let skippedCount = 0;
        
        try {
            // Validate the imported data structure
            if (typeof data !== 'object' || Array.isArray(data)) {
                throw new Error(langData.invalidDataFormat);
            }
            
            // Check if we should overwrite or merge
            const overwrite = importOverwrite.checked;
            const merge = importMerge.checked;
            
            if (overwrite) {
                window.notes = {};
            } else if (!merge) {
                throw new Error(langData.noImportOptionSelected || 'Please select an import option');
            }
            
            // Process each date in the imported data
            Object.keys(data).forEach(dateKey => {
                if (!Array.isArray(data[dateKey])) {
                    skippedCount++;
                    return;
                }
                
                // Process each note for the date
                data[dateKey].forEach(note => {
                    try {
                        // Validate the note structure
                        if (!note.text || typeof note.text !== 'string') {
                            skippedCount++;
                            return;
                        }
                        
                        // Normalize the date key
                        const normalizedDate = window.normalizeDateKey(dateKey);
                        
                        // Initialize the date array if it doesn't exist
                        if (!window.notes[normalizedDate]) {
                            window.notes[normalizedDate] = [];
                        }
                        
                        // Add the note with validated properties
                        window.notes[normalizedDate].push({
                            date: normalizedDate,
                            color: note.color || 'note-color-gray',
                            type: note.type || 'note',
                            text: window.sanitizeHTML(note.text),
                            time: note.time || '',
                            language: note.language || 'en',
                            currentCalendarSystem: note.currentCalendarSystem || 'gregorian'
                        });
                        
                        importedCount++;
                    } catch (e) {
                        skippedCount++;
                        console.warn(langData.failedToImportNote, e);
                    }
                });
            });
            
            // Save the imported notes
            saveNotes();
            
            // Update the display
            statusDisplay.textContent = langData.importComplete
                .replace('{importedCount}', importedCount)
                .replace('{skippedCount}', skippedCount);
            progressContainer.classList.add('hidden');
            
            // Refresh the calendar to show imported notes
            if (typeof renderCalendar === 'function') {
                renderCalendar(translations[window.currentLanguage]);
            }
            
        } catch (error) {
            statusDisplay.textContent = `${langData.importFailed}: ${error.message}`;
            progressContainer.classList.add('hidden');
            console.error('Import error:', error);
        }
    }
    
    function updateProgress(percent) {
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
    }
    
    // Initialize the UI when language changes
    document.addEventListener('languageChanged', updateExportImportUI);
    
    // Initial UI setup
    updateExportImportUI();
});