// Shared utility functions and constants

// Color options for notes
window.noteColors = [
    {class: 'note-color-gray', color: '#cccccc'},
    {class: 'note-color-red', color: '#ff6b6b'},
    {class: 'note-color-blue', color: '#48dbfb'},
    {class: 'note-color-green', color: '#1dd1a1'},
    {class: 'note-color-yellow', color: '#feca57'},
    {class: 'note-color-purple', color: '#5f27cd'}
];

// Note types with emoji icons
window.noteTypes = [
    {icon: '📝', type: 'note', label: 'Note'},
    {icon: '🎂', type: 'birthday', label: 'Birthday'},
    {icon: '🏥', type: 'medical', label: 'Medical'},
    {icon: '📅', type: 'event', label: 'Event'}
];

/**
 * Gets a stable date key in YYYY-MM-DD format
 * @param {Date} date - The date to convert
 * @return {string} Formatted date string
 */
window.getStableDateKey = function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Normalizes various date inputs to a stable YYYY-MM-DD format
 * @param {Date|string} dateInput - The date input to normalize
 * @return {string} Normalized date string
 */
window.normalizeDateKey = function(dateInput) {
    if (dateInput instanceof Date) {
        return getStableDateKey(dateInput);
    }
    
    if (typeof dateInput === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            return dateInput;
        }
        
        const isoMatch = dateInput.match(/^(\d{4}-\d{2}-\d{2})T/);
        if (isoMatch) return isoMatch[1];
        
        try {
            const parsedDate = new Date(dateInput);
            if (!isNaN(parsedDate)) {
                return getStableDateKey(parsedDate);
            }
        } catch (e) {
            console.warn('Date parsing failed:', dateInput);
        }
    }
    
    return getStableDateKey(new Date());
};

/**
 * Sanitizes HTML strings to prevent XSS
 * @param {string} str - The string to sanitize
 * @return {string} Sanitized string
 */
window.sanitizeHTML = function(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};