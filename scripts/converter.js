/**
 * Date conversion utilities and calendar system registry
 * Provides consistent date handling across different calendar systems
 */

// Global calendar systems registry
function getStableDateKey(date) {
    // Handle both Date objects and string inputs
    const d = date instanceof Date ? date : new Date(date);
    
    // Fallback for invalid dates
    if (isNaN(d.getTime())) {
        console.warn('Invalid date - using current date instead');
        return getLocalISODate(new Date());
    }
    
    // First try the new consistent format
    try {
        return getLocalISODate(d);
    } catch (e) {
        console.warn('Date format error - using ISO fallback');
        return d.toISOString().split('T')[0];
    }
}

function getLocalISODate(date) {
    const pad = n => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

window.calendarSystems = {
    gregorian: {
        monthsInYear: 12,
        getMonthStep: function(current, step) {
            let newMonth = current + step;
            return {
                month: (newMonth + 12) % 12,
                yearOffset: Math.floor(newMonth / 12)
            };
        }
    }
    // Additional calendar systems can be added here
};