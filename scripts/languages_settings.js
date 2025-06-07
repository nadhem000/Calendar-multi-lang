class LanguageSettingsManager {
    constructor() {
        this.initElements();
        this.loadSettings();
        this.setupEventListeners();
	}
	
    initElements() {
        this.styleSelect = document.getElementById('language-character-style');
        this.sizeSelect = document.getElementById('language-character-size');
        this.previewElement = document.querySelector('.settings-languages-preview-text');
        
        if (!this.previewElement) {
            const previewContainer = document.querySelector('.settings-languages-preview');
            if (previewContainer) {
                this.previewElement = document.createElement('p');
                this.previewElement.className = 'settings-languages-preview-text';
                this.previewElement.textContent = translations[currentLanguage].previewText || 'Sample Text - 123 ABC abc';
                previewContainer.appendChild(this.previewElement);
			}
		}
	}
	
    loadSettings() {
        // Load saved settings or use defaults
        const savedStyle = localStorage.getItem('characterStyle') || 'standard';
        const savedSize = localStorage.getItem('characterSize') || '12';
		
        if (this.styleSelect) this.styleSelect.value = savedStyle;
        if (this.sizeSelect) this.sizeSelect.value = savedSize;
		
        this.applySettings(savedStyle, savedSize);
	}
	
    setupEventListeners() {
        if (this.styleSelect) {
            this.styleSelect.addEventListener('change', (e) => {
                const style = e.target.value;
                localStorage.setItem('characterStyle', style);
                this.applySettings(style, this.sizeSelect.value);
			});
		}
		
        if (this.sizeSelect) {
            this.sizeSelect.addEventListener('change', (e) => {
                const size = e.target.value;
                localStorage.setItem('characterSize', size);
                this.applySettings(this.styleSelect.value, size);
			});
		}
	}
	
    applySettings(style, size) {
    // Apply styles to preview
    if (this.previewElement) {
        let fontFamily = '';
        let fontWeight = 'normal';
        
        switch(style) {
            case 'new-york-times':
                fontFamily = '"Times New Roman", Times, serif';
                fontWeight = 'normal';
                break;
            case 'aharoni':
                fontFamily = 'Aharoni, "Segoe UI", sans-serif';
                fontWeight = 'bold';
                break;
            default: // standard
                fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
                fontWeight = 'normal';
        }

        // Apply to preview
        this.previewElement.style.fontFamily = fontFamily;
        this.previewElement.style.fontWeight = fontWeight;
        this.previewElement.style.fontSize = `${size}px`;
        
        // Apply to document root as CSS variables
        document.documentElement.style.setProperty('--character-font-family', fontFamily);
        document.documentElement.style.setProperty('--character-font-weight', fontWeight);
        document.documentElement.style.setProperty('--character-font-size', `${size}px`);
    }
}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageSettingsManager = new LanguageSettingsManager();
});