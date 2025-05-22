// Global calendar systems registry
function getStableDateKey(date) {
  // Handle both Date objects and string inputs
  const d = date instanceof Date ? date : new Date(date);
  
  // Fallback for invalid dates
  if (isNaN(d.getTime())) {
    console.warn('Invalid date detected, using current date as fallback');
    return getLocalISODate(new Date());
  }

  // First try the new consistent format
  try {
    return getLocalISODate(d);
  } catch (e) {
    console.warn('Date formatting error, falling back to legacy handling');
    // Fallback to old behavior but sanitized
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
        month: (newMonth + 12) % 12, // Ensure positive modulo
        yearOffset: Math.floor(newMonth / 12)
      };
    }
  }
  // Add new systems here later
};