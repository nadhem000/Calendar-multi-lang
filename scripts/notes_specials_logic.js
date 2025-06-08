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
        const isWeekend = day === 0 || day === 6;
        let include = true;

        switch (weekendsOption) {
            case 'none': include = !isWeekend; break;
            case 'saturday': include = (day !== 0); break;
            case 'sunday': include = (day !== 6); break;
            case 'both': include = true; break;
        }

        if (include) {
            dates.push(current.toISOString().split('T')[0]);
        }

        switch (pattern) {
            case 'daily': current.setDate(current.getDate() + 1); break;
            case 'weekly': current.setDate(current.getDate() + 7); break;
            case 'monthly': current.setMonth(current.getMonth() + 1); break;
            case 'yearly': current.setFullYear(current.getFullYear() + 1); break;
        }
    }
    return dates;
};