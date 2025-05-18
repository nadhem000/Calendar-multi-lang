// Calendar functionality
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
const today = new Date();
function renderCalendar(langData) {
  const months = currentCalendarSystem === 'hijri' 
    ? langData.monthsHijri 
    : langData.months;
    const monthYearElement = document.getElementById('month-year-display');
    const todayDateElement = document.getElementById('today-date-label');
    const daysElement = document.getElementById('calendar-days');
    // Set month and year in scroller
    monthYearElement.textContent = `${langData.months[currentMonth]} ${currentYear}`;
    // ALWAYS show today's full date
    if (todayDateElement) {
        const dateFormatter = new Intl.DateTimeFormat(currentLanguage, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
		});
        todayDateElement.textContent = `${translations[currentLanguage].todayText}: ${dateFormatter.format(today)}`;
	}
    // Get days from previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    // Rest of calendar rendering
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    daysElement.innerHTML = '';
    // Previous month's days
    for (let i = firstDay; i > 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('empty', 'shadow-day');
        dayElement.textContent = daysInPrevMonth - i + 1;
        daysElement.appendChild(dayElement);
	}
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.style.position = 'relative';
        // Highlight today
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayElement.classList.add('today');
		}
        // Add note indicators if they exist
        const dateKey = new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
		
		if (window.notes && window.notes[dateKey] && window.notes[dateKey].length > 0) {
			const dateNotes = window.notes[dateKey]; // Show ALL notes regardless of language
			
			// Create color band element
			const colorBand = document.createElement('div');
			colorBand.className = 'note-color-band';
			
			// Get colors from first 3 notes (any language)
			dateNotes.slice(0, 3).forEach(note => {
				const colorObj = noteColors.find(c => c.class === note.color);
				const colorDot = document.createElement('div');
				colorDot.className = 'color-dot';
				colorDot.style.backgroundColor = colorObj ? colorObj.color : '#cccccc';
				colorBand.appendChild(colorDot);
			});
			
			// Style and append
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
    // Next month's days
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
    // Update weekday names
    const weekdayElements = document.querySelectorAll('.weekdays div');
    weekdayElements.forEach((el, index) => {
        el.textContent = langData.weekdays[index];
	});
    updateTodayButton();
}
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
	}
    renderCalendar(translations[currentLanguage]);
}
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
	}
    renderCalendar(translations[currentLanguage]);
}
const calendarSystems = {
    gregorian: {
        name: "Gregorian",
        getDaysInMonth: (year, month) => new Date(year, month + 1, 0).getDate()
	}
};
let currentCalendarSystem = 'gregorian';