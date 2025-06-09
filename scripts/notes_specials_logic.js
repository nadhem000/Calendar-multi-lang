// Special notes business logic

// Generate dates based on pattern
window.generateDates = function(startDate, pattern, weekendsOption, duration) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(start);
    
    // Set end date based on duration
    if (duration === 'custom') {
        end.setFullYear(start.getFullYear() + 1);
    } else {
        end.setFullYear(start.getFullYear() + parseInt(duration));
    }

    let current = new Date(start);
    while (current <= end) {
        const day = current.getDay();
        let adjustedDate = new Date(current);
        let needsAdjustment = false;

        // Handle weekend exclusion
        switch (weekendsOption) {
            case 'none':
                if (day === 0 || day === 6) { // Sunday or Saturday
                    needsAdjustment = true;
                    adjustedDate.setDate(adjustedDate.getDate() + (day === 6 ? 2 : 1)); // Sat → +2, Sun → +1
                }
                break;
            case 'saturday':
                if (day === 0) { // Sunday only
                    needsAdjustment = true;
                    adjustedDate.setDate(adjustedDate.getDate() + 1); // Sun → Mon
                }
                break;
            case 'sunday':
                if (day === 6) { // Saturday only
                    needsAdjustment = true;
                    adjustedDate.setDate(adjustedDate.getDate() + 2); // Sat → Mon
                }
                break;
            case 'both':
                // No adjustment needed
                break;
        }

        // If we adjusted the date, check if the new date is valid
        if (needsAdjustment) {
            const adjustedDay = adjustedDate.getDay();
            // For 'none' option, ensure adjusted date isn't on a weekend
            if (weekendsOption === 'none' && (adjustedDay === 0 || adjustedDay === 6)) {
                adjustedDate.setDate(adjustedDate.getDate() + (adjustedDay === 6 ? 2 : 1));
            }
            // For 'saturday' option, ensure adjusted date isn't on Sunday
            else if (weekendsOption === 'saturday' && adjustedDay === 0) {
                adjustedDate.setDate(adjustedDate.getDate() + 1);
            }
            // For 'sunday' option, ensure adjusted date isn't on Saturday
            else if (weekendsOption === 'sunday' && adjustedDay === 6) {
                adjustedDate.setDate(adjustedDate.getDate() + 2);
            }
        }

        // Add the date (either original or adjusted)
        dates.push(adjustedDate.toISOString().split('T')[0]);

        // Increment based on pattern
        switch (pattern) {
            case 'daily': 
                current.setDate(current.getDate() + 1); 
                break;
            case 'weekly': 
                current.setDate(current.getDate() + 7); 
                break;
            case 'monthly': 
                current.setMonth(current.getMonth() + 1); 
                break;
            case 'three_months':
                current.setMonth(current.getMonth() + 3);
                break;
            case 'yearly': 
                current.setFullYear(current.getFullYear() + 1); 
                break;
        }
    }
    return dates;
};