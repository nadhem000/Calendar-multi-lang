// calendar_settings.js
class CalendarSettings {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.hijriConverter = null;
        this.initCalendarSettings();
    }

    initCalendarSettings() {
        const calendarSelectSettings = this.settingsManager.modal.querySelector('#calendar-system-settings');
        if (calendarSelectSettings) {
            calendarSelectSettings.value = 'gregorian';
            calendarSelectSettings.disabled = true;
            
            const newSelect = calendarSelectSettings.cloneNode(true);
            calendarSelectSettings.parentNode.replaceChild(newSelect, calendarSelectSettings);
            
            this.addHijriConverterButton();
        }
    }

    addHijriConverterButton() {
        const calendarTab = this.settingsManager.modal.querySelector('#calendar-tab');
        if (!calendarTab) return;

        // Remove existing button if it exists
        const existingBtn = calendarTab.querySelector('.calendar-settings-hijri-converter-btn');
        if (existingBtn) existingBtn.remove();

        // Create new button
        const btn = document.createElement('button');
        btn.className = 'calendar-settings-hijri-converter-btn';
        btn.innerHTML = `
        <i class="calendar-settings-icon">📅</i>
        ${translations[currentLanguage].hijriConverter.title || 'Hijri Converter'}
    `;
    btn.setAttribute('data-tooltip', translations[currentLanguage].hijriConverter.hijriConverterTooltip || 'Convert between Gregorian and Hijri dates');
    
        
        btn.addEventListener('click', () => {
            this.showHijriConverter();
        });

        const insertPoint = calendarTab.querySelector('.calendar-settings-text') || 
                          calendarTab.querySelector('h3') || 
                          calendarTab;
        insertPoint.insertAdjacentElement('afterend', btn);
    }

    showHijriConverter() {
        // Check if modal already exists
        const existingModal = document.getElementById('hijri-converter-modal');
        if (existingModal) {
            existingModal.remove();
            return;
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'hijri-converter-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
        // Create content container
        const content = document.createElement('div');
        content.id = 'hijri-converter-content';
        content.style.backgroundColor = 'white';
        content.style.padding = '20px';
        content.style.borderRadius = '5px';
        content.style.width = '80%';
        content.style.maxWidth = '800px';
        content.style.maxHeight = '90vh';
        content.style.overflow = 'auto';
        content.style.position = 'relative';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Add content to modal
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Initialize the Hijri converter in the modal content
        this.hijriConverter = new HijriConverter(content);
    }

    updateLanguageTexts() {
        const lang = translations[currentLanguage];
        
        // Update tab button text
        const tabBtn = document.querySelector('[data-tab="calendar"]');
        if (tabBtn) tabBtn.textContent = lang.calendar || 'Calendar';
        
        // Update tab content title
        const tabTitle = document.querySelector('#calendar-tab h3');
        if (tabTitle) tabTitle.textContent = lang.calendarSettings || 'Calendar Settings';
        
        // Update calendar system label
        const calendarText = document.querySelector('.calendar-settings-text');
        if (calendarText) calendarText.textContent = lang.calendarSystem || 'Calendar System';

        // Update Hijri converter button
        const hijriBtn = this.settingsManager.modal.querySelector('.calendar-settings-hijri-converter-btn');
        if (hijriBtn) {
            hijriBtn.innerHTML = `
                <i class="calendar-settings-icon">📅</i>
                ${lang.hijriConverter.title || 'Hijri Converter'}
            `;
            hijriBtn.setAttribute('data-tooltip', lang.hijriConverter.hijriConverterTooltip || 'Convert between Gregorian and Hijri dates');
        }

        // Update calendar system select options
        const calendarSelect = this.settingsManager.modal.querySelector('#calendar-system-settings');
        if (calendarSelect) {
            const currentSystem = calendarSelect.value || 'gregorian';
            calendarSelect.innerHTML = Object.entries(lang.calendarSystems)
                .map(([value, name]) => `<option value="${value}">${name}</option>`)
                .join('');
            calendarSelect.value = currentSystem; // Maintain current selection
            calendarSelect.disabled = true; // Keep it disabled
        }
    }
}