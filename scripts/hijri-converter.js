// hijri-converter.js
class HijriConverter {
    constructor(container) {
        this.ISLAMIC_EPOCH = 1948439.5;
        this.ISLAMIC_WEEKDAYS = ["al-'ahad", "al-'ithnayn", "ath-thalatha'", "al-'arb`a'", "al-khamis", "al-jum`a", "as-sabt"];
        this.GREGORIAN_EPOCH = 1721425.5;
        this.HIJRI_MONTHS = [
            "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
            "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
            "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
        ];
        this.GREGORIAN_MONTHS = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        this.container = container;
        this.init();
    }
    
    init() {
        this.createUI();
        this.setCurrentDate();
        this.generateCalendars();
        this.setupEventListeners();
    }
    
    createUI() {
        const lang = translations[currentLanguage].hijriConverter || {};
        const commonLang = translations[currentLanguage].hijriConverter || {};
        
        this.container.innerHTML = `
            <div class="hijri-converter-container">
                <button class="hijri-converter-exit-button" title="${commonLang.close || 'Close'}">&times;</button>
                <div class="hijri-converter-box-container">
                    <div class="hijri-converter-box">
                        <h2 class="hijri-converter-title">${lang.gregorianToHijri || 'Gregorian to Hijri'}</h2>
                        <div>
                            <label for="greg-year" title="${lang.yearTooltip || 'Enter Gregorian year'}">${lang.year || 'Year'}:</label>
                            <input type="number" id="greg-year" class="hijri-converter-input" min="1" max="9999" value="2023" 
                                title="${lang.yearInputTooltip || 'Enter year between 1 and 9999'}">
                        </div>
                        <div>
                            <label for="greg-month" title="${lang.monthTooltip || 'Select Gregorian month'}">${lang.month || 'Month'}:</label>
                            <select id="greg-month" class="hijri-converter-input" title="${lang.monthSelectTooltip || 'Select month'}">
                                ${this.GREGORIAN_MONTHS.map((month, index) => 
                                    `<option value="${index + 1}">${month}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="greg-day" title="${lang.dayTooltip || 'Enter day of month'}">${lang.day || 'Day'}:</label>
                            <input type="number" id="greg-day" class="hijri-converter-input" min="1" max="31" value="1" 
                                title="${lang.dayInputTooltip || 'Enter day between 1 and 31'}">
                        </div>
                        <button id="convert-greg-to-hijri" class="hijri-converter-button" 
                            title="${lang.convertTooltip || 'Convert to Hijri date'}">
                            ${lang.convert || 'Convert'}
                        </button>
                        <div class="hijri-converter-result" id="hijri-result">
                            ${lang.hijriDate || 'Hijri date'} ${commonLang.underDevelopment || 'will appear here'}
                        </div>
                    </div>
                    
                    <div class="hijri-converter-box">
                        <h2 class="hijri-converter-title">${lang.hijriToGregorian || 'Hijri to Gregorian'}</h2>
                        <div>
                            <label for="hijri-year" title="${lang.hijriYearTooltip || 'Enter Hijri year'}">${lang.year || 'Year'}:</label>
                            <input type="number" id="hijri-year" class="hijri-converter-input" min="1" max="9999" value="1444" 
                                title="${lang.hijriYearInputTooltip || 'Enter year between 1 and 9999'}">
                        </div>
                        <div>
                            <label for="hijri-month" title="${lang.hijriMonthTooltip || 'Select Hijri month'}">${lang.month || 'Month'}:</label>
                            <select id="hijri-month" class="hijri-converter-input" title="${lang.hijriMonthSelectTooltip || 'Select month'}">
                                ${this.HIJRI_MONTHS.map((month, index) => 
                                    `<option value="${index + 1}">${month}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="hijri-day" title="${lang.hijriDayTooltip || 'Enter day of month'}">${lang.day || 'Day'}:</label>
                            <input type="number" id="hijri-day" class="hijri-converter-input" min="1" max="30" value="1" 
                                title="${lang.hijriDayInputTooltip || 'Enter day between 1 and 30'}">
                        </div>
                        <button id="convert-hijri-to-greg" class="hijri-converter-button" 
                            title="${lang.convertTooltip || 'Convert to Gregorian date'}">
                            ${lang.convert || 'Convert'}
                        </button>
                        <div class="hijri-converter-result" id="greg-result">
                            ${lang.gregorianDate || 'Gregorian date'} ${commonLang.underDevelopment || 'will appear here'}
                        </div>
                    </div>
                </div>
                
                <div class="hijri-converter-box-container">
                    <div class="hijri-converter-box">
                        <h2 class="hijri-converter-title">${lang.hijriCalendar || 'Hijri Calendar (Current Month)'}</h2>
                        <div id="hijri-calendar"></div>
                    </div>
                    <div class="hijri-converter-box">
                        <h2 class="hijri-converter-title">${lang.gregorianCalendar || 'Gregorian Calendar (Current Month)'}</h2>
                        <div id="gregorian-calendar"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setCurrentDate() {
        const today = new Date();
        document.getElementById('greg-year').value = today.getFullYear();
        document.getElementById('greg-month').value = today.getMonth() + 1;
        document.getElementById('greg-day').value = today.getDate();
        
        // Also convert today's date to Hijri
        this.convertGregorianToHijri();
    }
    
    setupEventListeners() {
        document.getElementById('convert-greg-to-hijri').addEventListener('click', () => {
            this.convertGregorianToHijri();
        });
        
        document.getElementById('convert-hijri-to-greg').addEventListener('click', () => {
            this.convertHijriToGregorian();
        });
        
        // Add exit button listener
        this.container.querySelector('.hijri-converter-exit-button').addEventListener('click', () => {
            this.closeConverter();
        });
        
        // Close when clicking outside the converter
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.closeConverter();
            }
        });
    }
    
    closeConverter() {
        // Get the modal container (parent of the content)
        const modal = this.container.parentElement;
        
        // Fade out animation
        modal.style.transition = 'opacity 0.3s';
        modal.style.opacity = '0';
        
        // Remove after animation completes
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Helper functions
    mod(a, b) {
        return a - (b * Math.floor(a / b));
    }
    
    jwday(jd) {
        return this.mod(Math.floor((jd + 1.5)), 7);
    }
    
    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
    
    // Calendar conversion functions
    leap_islamic(year) {
        return (((year * 11) + 14) % 30) < 11;
    }
    
    islamic_to_jd(year, month, day) {
        return (day +
            Math.ceil(29.5 * (month - 1)) +
            (year - 1) * 354 +
            Math.floor((3 + (11 * year)) / 30) +
            this.ISLAMIC_EPOCH) - 1;
    }
    
    jd_to_islamic(jd) {
        jd = Math.floor(jd) + 0.5;
        let year = Math.floor(((30 * (jd - this.ISLAMIC_EPOCH)) + 10646) / 10631);
        let month = Math.min(12,
            Math.ceil((jd - (29 + this.islamic_to_jd(year, 1, 1))) / 29.5) + 1);
        let day = (jd - this.islamic_to_jd(year, month, 1)) + 1;
        return {year, month, day};
    }
    
    leap_gregorian(year) {
        return ((year % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0)));
    }
    
    gregorian_to_jd(year, month, day) {
        return (this.GREGORIAN_EPOCH - 1) +
            (365 * (year - 1)) +
                Math.floor((year - 1) / 4) +
                (-Math.floor((year - 1) / 100)) +
                Math.floor((year - 1) / 400) +
                Math.floor((((367 * month) - 362) / 12) +
            ((month <= 2) ? 0 : (this.leap_gregorian(year) ? -1 : -2)) +
            day);
    }
    
    jd_to_gregorian(jd) {
        let wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, year, yearday, leapadj, month, day;
        
        wjd = Math.floor(jd - 0.5) + 0.5;
        depoch = wjd - this.GREGORIAN_EPOCH;
        quadricent = Math.floor(depoch / 146097);
        dqc = this.mod(depoch, 146097);
        cent = Math.floor(dqc / 36524);
        dcent = this.mod(dqc, 36524);
        quad = Math.floor(dcent / 1461);
        dquad = this.mod(dcent, 1461);
        yindex = Math.floor(dquad / 365);
        year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
        if (!((cent == 4) || (yindex == 4))) {
            year++;
        }
        yearday = wjd - this.gregorian_to_jd(year, 1, 1);
        leapadj = ((wjd < this.gregorian_to_jd(year, 3, 1)) ? 0 : (this.leap_gregorian(year) ? 1 : 2));
        month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
        day = (wjd - this.gregorian_to_jd(year, month, 1)) + 1;
        
        return {year, month, day};
    }
    
    // Conversion functions
    convertGregorianToHijri() {
        const lang = translations[currentLanguage].hijriConverter || {};
        const year = parseInt(document.getElementById('greg-year').value);
        const month = parseInt(document.getElementById('greg-month').value);
        const day = parseInt(document.getElementById('greg-day').value);
        
        // Validate inputs
        if (isNaN(year) || isNaN(month) || isNaN(day) || 
            month < 1 || month > 12 || day < 1 || day > 31) {
            document.getElementById('hijri-result').innerHTML = lang.invalidDate || "Invalid date";
            return;
        }
        
        // Convert to Julian day
        const jd = this.gregorian_to_jd(year, month, day);
        
        // Convert to Islamic date
        const hijri = this.jd_to_islamic(jd);
        
        // Get weekday
        const weekday = this.ISLAMIC_WEEKDAYS[this.jwday(jd)];
        
        // Display result
        document.getElementById('hijri-result').innerHTML = `
            <strong>${lang.hijriDate || 'Hijri Date'}:</strong> ${hijri.day} ${this.HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} AH<br>
            <strong>${lang.weekday || 'Weekday'}:</strong> ${weekday}<br>
            <strong>${lang.leapYear || 'Leap Year'}:</strong> ${this.leap_islamic(hijri.year) ? (lang.yes || 'Yes') : (lang.no || 'No')}
        `;
    }
    
    convertHijriToGregorian() {
        const lang = translations[currentLanguage].hijriConverter || {};
        const year = parseInt(document.getElementById('hijri-year').value);
        const month = parseInt(document.getElementById('hijri-month').value);
        const day = parseInt(document.getElementById('hijri-day').value);
        
        // Validate inputs
        if (isNaN(year) || isNaN(month) || isNaN(day) || 
            month < 1 || month > 12 || day < 1 || day > 30) {
            document.getElementById('greg-result').innerHTML = lang.invalidDate || "Invalid date";
            return;
        }
        
        // Convert to Julian day
        const jd = this.islamic_to_jd(year, month, day);
        
        // Convert to Gregorian date
        const greg = this.jd_to_gregorian(jd);
        
        // Get weekday
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.jwday(jd)];
        
        // Display result
        document.getElementById('greg-result').innerHTML = `
            <strong>${lang.gregorianDate || 'Gregorian Date'}:</strong> ${greg.day} ${this.GREGORIAN_MONTHS[greg.month - 1]} ${greg.year}<br>
            <strong>${lang.weekday || 'Weekday'}:</strong> ${weekday}<br>
            <strong>${lang.leapYear || 'Leap Year'}:</strong> ${this.leap_gregorian(greg.year) ? (lang.yes || 'Yes') : (lang.no || 'No')}
        `;
    }
    
    // Calendar generation functions
    generateHijriCalendar() {
        const lang = translations[currentLanguage].hijriConverter || {};
        const todayHijri = this.jd_to_islamic(this.gregorian_to_jd(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
        const hijriYear = todayHijri.year;
        const hijriMonth = todayHijri.month;
        const firstDay = this.islamic_to_jd(hijriYear, hijriMonth, 1);
        const daysInMonth = (hijriMonth === 12 && this.leap_islamic(hijriYear)) ? 30 : (hijriMonth % 2 === 1 ? 30 : 29);
        const startWeekday = this.jwday(firstDay);
        
        // Create table structure
        let calendarHTML = `
            <h3 class="hijri-converter-calendar-title">${this.HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} AH</h3>
            <table class="hijri-converter-table">
                <thead>
                    <tr>
                        <th>${lang.sun || 'Sun'}</th>
                        <th>${lang.mon || 'Mon'}</th>
                        <th>${lang.tue || 'Tue'}</th>
                        <th>${lang.wed || 'Wed'}</th>
                        <th>${lang.thu || 'Thu'}</th>
                        <th>${lang.fri || 'Fri'}</th>
                        <th>${lang.sat || 'Sat'}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let day = 1;
        for (let i = 0; i < 6; i++) { // 6 rows max (weeks)
            calendarHTML += '<tr>';
            for (let j = 0; j < 7; j++) { // 7 days in a week
                if ((i === 0 && j < startWeekday) || day > daysInMonth) {
                    calendarHTML += '<td></td>';
                } else {
                    const isToday = (day === todayHijri.day && hijriMonth === todayHijri.month && hijriYear === todayHijri.year);
                    calendarHTML += `<td${isToday ? ' class="today"' : ''}>${day}</td>`;
                    day++;
                }
            }
            calendarHTML += '</tr>';
            if (day > daysInMonth) break;
        }
        
        calendarHTML += `
                </tbody>
            </table>
        `;
        
        document.getElementById('hijri-calendar').innerHTML = calendarHTML;
    }
    
    generateGregorianCalendar() {
        const lang = translations[currentLanguage].hijriConverter || {};
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startWeekday = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // Create table structure
        let calendarHTML = `
            <h3 class="hijri-converter-calendar-title">${this.GREGORIAN_MONTHS[month]} ${year}</h3>
            <table class="hijri-converter-table">
                <thead>
                    <tr>
                        <th>${lang.sun || 'Sun'}</th>
                        <th>${lang.mon || 'Mon'}</th>
                        <th>${lang.tue || 'Tue'}</th>
                        <th>${lang.wed || 'Wed'}</th>
                        <th>${lang.thu || 'Thu'}</th>
                        <th>${lang.fri || 'Fri'}</th>
                        <th>${lang.sat || 'Sat'}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let day = 1;
        for (let i = 0; i < 6; i++) { // 6 rows max (weeks)
            calendarHTML += '<tr>';
            for (let j = 0; j < 7; j++) { // 7 days in a week
                if ((i === 0 && j < startWeekday) || day > daysInMonth) {
                    calendarHTML += '<td></td>';
                } else {
                    const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
                    calendarHTML += `<td${isToday ? ' class="today"' : ''}>${day}</td>`;
                    day++;
                }
            }
            calendarHTML += '</tr>';
            if (day > daysInMonth) break;
        }
        
        calendarHTML += `
                </tbody>
            </table>
        `;
        
        document.getElementById('gregorian-calendar').innerHTML = calendarHTML;
    }
    
    generateCalendars() {
        this.generateHijriCalendar();
        this.generateGregorianCalendar();
    }
}