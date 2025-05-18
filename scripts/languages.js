// Language translations
const translations = {
    en: {
        title: "Calendar",
		todayText: "Today",
		notePlaceholder: "Add your note here...",
		save: "Save",
		close: "Close",
		existingNotes: "Existing Notes",
		validationError: "Please select a color, type and enter note text",
		delete: "Delete",
		confirmDelete: "Are you sure you want to delete this note?",
		storageWarning: "Your storage is almost full. Some features may not work properly.",
		clearStorage: "Clear old data",
		updateAvailable: "New version available!",
		reload: "Reload",
		storageCleared: "Old data cleared successfully",
		storageError: "Error clearing old data",
		Install: "Install App",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        icons: {
            plate: "Plate",
            health: "Health",
            mechanics: "Mechanics"
		},
		calendarSystems: {
			gregorian: "Gregorian",
			hijri: "Islamic Hijri"
		},
		monthsHijri: [
			"Muharram",
			"Safar",
			"Rabi' al-Awwal",
			"Rabi' al-Thani",
			"Jumada al-Awwal",
			"Jumada al-Thani",
			"Rajab",
			"Sha'ban",
			"Ramadan",
			"Shawwal",
			"Dhu al-Qidah",
			"Dhul-Hijjah"
		]
	},
    ar: {
        title: "التقويم",
		todayText: "اليوم",
		notePlaceholder: "أضف ملاحظتك هنا...",
		save: "حفظ",
		close: "إغلاق",
		existingNotes: "الملاحظات الموجودة",
		validationError: "الرجاء اختيار لون ونوع وإدخال نص الملاحظة",
		delete: "مسح",
		confirmDelete: "هل أنت متأكد أنك تريد محو الملاحظة؟",
		storageWarning: "التخزين شبه ممتلئ. قد لا تعمل بعض الميزات بشكل صحيح.",
		clearStorage: "مسح البيانات القديمة",
		updateAvailable: "نسخة جديدة متوفرة!",
		reload: "إعادة التحميل",
		storageCleared: "تم مسح البيانات القديمة بنجاح",
		storageError: "خطأ أثناء مسح البيانات القديمة",
		Install: "تثبيت التطبيق",
        months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
        weekdays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        icons: {
            plate: "الطعام",
            health: "الصحة",
            mechanics: "الميكانيكا"
		},
		calendarSystems: {
			gregorian: "الميلادي",
			hijri: "الهجري"
		},
		monthsHijri: [
			"محرم",
			"صفر",
			"ربيع الأول",
			"ربيع الآخر",
			"جمادى الأولى",
			"جمادى الآخرة",
			"رجب",
			"شعبان",
			"رمضان",
			"شوال",
			"ذو القعدة",
			"ذو الحجة"
		]
	},
    fr: {
        title: "Calendrier",
		todayText: "Aujourd'hui",
		notePlaceholder: "Ajoutez votre note ici...",
		save: "Enregistrer",
		close: "Fermer",
		existingNotes: "Notes Existants",
		confirmDelete: "T'es sure d'effacer cette note?",
		validationError: "Veuillez sélectionner une couleur, un type et saisir le texte de la note",
		delete: "effacer",
		storageWarning: "Votre stockage est presque plein. Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
		clearStorage: "Effacer les anciennes données",
		updateAvailable: "Nouvelle version disponible!",
		reload: "Recharger",
		storageCleared: "Anciennes données effacées avec succès",
		storageError: "Erreur lors de la suppression des anciennes données",
		Install: "Installer l'application",
        months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        weekdays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        icons: {
            plate: "Assiette",
            health: "Santé",
            mechanics: "Mécanique"
		},
		calendarSystems: {
			gregorian: "Grégorien",
			hijri: "Hijri Islamique"
		},
		monthsHijri: [
			"Mouharram",
			"Safar",
			"Rabi al-Awwal",
			"Rabi ath-Thani",
			"Joumada al-Awwal",
			"Joumada ath-Thani",
			"Rajab",
			"Chaabane",
			"Ramadan",
			"Chawwal",
			"Dhou al-Qi'dah",
			"Dhoul Hijja"
		]
	}
};
// Function to change language
function changeLanguage(lang) {
    const prevSystem = currentCalendarSystem;
    currentLanguage = lang;
    const langData = translations[lang];
    // Update calendar system options
    const systemSelect = document.getElementById('calendar-system');
    if (systemSelect) {
        systemSelect.innerHTML = Object.entries(langData.calendarSystems)
            .map(([value, name]) => 
                `<option value="${value}" ${value === prevSystem ? 'selected' : ''}>${name}</option>`
            ).join('');
        currentCalendarSystem = prevSystem; // Restore previous system
    }
    // Update all text elements
    document.querySelector('.title').textContent = langData.title;
    document.getElementById('plate-icon').setAttribute('title', langData.icons.plate);
    document.getElementById('health-icon').setAttribute('title', langData.icons.health);
    document.getElementById('mechanics-icon').setAttribute('title', langData.icons.mechanics);
    document.getElementById('today-btn').innerHTML = `<i class="fas fa-calendar-day"></i> ${langData.todayText}`;
    
    // Update calendar immediately
    renderCalendar(langData);
    
    // Set document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    return langData;
}
// Initialize language
let currentLanguage = 'en';