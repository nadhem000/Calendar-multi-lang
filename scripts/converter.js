// Global calendar systems registry
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