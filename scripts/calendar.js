/**
 * Main calendar rendering and navigation functionality
 * Supports multiple calendar systems (Gregorian as default)
 */
let currentDate = new Date();          // Track current view date
let currentYear = currentDate.getFullYear();  // Current view year
let currentMonth = currentDate.getMonth();    // Current view month (0-11)
const today = new Date();              // Actual current date for comparisons

/**
 * Generate consistent date key format (YYYY-MM-DD)
 * @param {Date} date - Date object to format
 * @return {string} Formatted date string
 */
function getStableDateKey(date) {
    // Ensure consistent 2-digit formatting for month/day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Render the calendar UI for current month/year
 * @param {Object} langData - Language translations for months/weekdays
 */
function renderCalendar(langData) {
    // DEBUG: Tracking calendar rendering
    console.debug(`Rendering calendar view for ${currentYear}-${currentMonth+1}`);
    
    const monthYearElement = document.getElementById('month-year-display');
    const todayDateElement = document.getElementById('today-date-label');
    const daysElement = document.getElementById('calendar-days');

    // Display current month and year in header with English fallback
    const monthName = (langData && langData.months && langData.months[currentMonth]) 
                    ? langData.months[currentMonth] 
                    : (translations.en.months[currentMonth] || `Month ${currentMonth+1}`);
    monthYearElement.textContent = `${monthName} ${currentYear}`;

    // Always display today's date in full format with English fallback
    if (todayDateElement) {
        const todayText = (translations[currentLanguage] && translations[currentLanguage].todayText)
                        ? translations[currentLanguage].todayText
                        : translations.en.todayText;
        try {
            const dateFormatter = new Intl.DateTimeFormat(currentLanguage, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            todayDateElement.textContent = `${todayText}: ${dateFormatter.format(today)}`;
        } catch (e) {
            // Fallback to English if formatting fails
            console.debug('Date formatting failed, using English fallback');
            const dateFormatter = new Intl.DateTimeFormat('en', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            todayDateElement.textContent = `${translations.en.todayText}: ${dateFormatter.format(today)}`;
        }
    }

    // Calculate calendar grid dimensions
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    daysElement.innerHTML = '';

    // Fill in days from previous month (empty cells)
    for (let i = firstDay; i > 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('empty', 'shadow-day');
        dayElement.textContent = daysInPrevMonth - i + 1;
        daysElement.appendChild(dayElement);
    }

    // Create cells for current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(currentYear, currentMonth, i);
        const dateKey = normalizeDateKey(dateObj);
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.style.position = 'relative';

        // Highlight today's date if applicable
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayElement.classList.add('today');
            console.debug(`Today highlighted: ${dateKey}`);
        }

        // Add note indicators if notes exist for this date
        if (window.notes && window.notes[dateKey] && window.notes[dateKey].length > 0) {
            const dateNotes = window.notes[dateKey];
            console.debug(`Found notes for date: ${dateKey}`);
            
            const colorBand = document.createElement('div');
            colorBand.className = 'note-color-band';
            
            // Display color indicators for first 3 notes
            dateNotes.slice(0, 3).forEach(note => {
                const colorObj = noteColors.find(c => c.class === note.color);
                const colorDot = document.createElement('div');
                colorDot.className = 'color-dot';
                colorDot.style.backgroundColor = colorObj ? colorObj.color : '#cccccc';
                colorBand.appendChild(colorDot);
            });
            
            // Position color band at bottom of date cell
            colorBand.style.position = 'absolute';
            colorBand.style.bottom = '0';
            colorBand.style.left = '0';
            colorBand.style.right = '0';
            colorBand.style.height = '4px';
            colorBand.style.display = 'flex';
            dayElement.appendChild(colorBand);
        }
        daysElement.appendChild(dayElement);
    }

    // Fill remaining grid cells with next month's days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('empty', 'shadow-day');
            dayElement.textContent = i;
            daysElement.appendChild(dayElement);
        }
    }

    // Update weekday names according to current language with English fallback
    const weekdayElements = document.querySelectorAll('.weekdays div');
    weekdayElements.forEach((el, index) => {
        const weekdayName = (langData && langData.weekdays && langData.weekdays[index])
                          ? langData.weekdays[index]
                          : translations.en.weekdays[index];
        el.textContent = weekdayName || `Day ${index}`;
    });
    
    updateTodayButton();
}

/**
 * Navigate to next month in calendar view
 */
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
        console.debug(`Year changed to ${currentYear}`);
    }
    renderCalendar(translations[currentLanguage] || translations.en);
}

/**
 * Navigate to previous month in calendar view
 */
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
        console.debug(`Year changed to ${currentYear}`);
    }
    renderCalendar(translations[currentLanguage] || translations.en);
}

/**
 * Calendar system definitions
 * Currently only Gregorian is implemented
 */
const calendarSystems = {
    gregorian: {
        name: "Gregorian",
        getDaysInMonth: (year, month) => new Date(year, month + 1, 0).getDate()
    }
    // Additional calendar systems can be added here
};