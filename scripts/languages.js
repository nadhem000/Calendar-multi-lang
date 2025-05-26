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
		],
		back: "Back",
		delai: "Frequency",
		offlineSave: "Note saved offline. Will sync when online",
		backgroundSync: "Background sync active",
		periodicUpdate: "Daily updates enabled",
		notesReminder: "You have {count} notes for today",
		dailyTip: "Daily Tip",
		noTipToday: "No tip for today",
		noNotesToday: "No notes for today",
		sanitizeWarning: "Note : Special caracters will be cleaned automatically",
		validationErrorText: "Enter the note's text",
		edit: "Edit",
		noteSettings: "Note Settings",
		noteLabel: "Note Content",
		modalClose: "Close modal",
		onlineStatus: "Online",
		offlineStatus: "Offline",
		storageUsage: "Using {percentage}% of available storage",
		databaseError: "Database error. Some features may not work properly.",
		fileTooLarge: "File is too large to save offline",
		fileReadError: "Failed to read file",
		cleanupError: "Error during cleanup",
		noteSettings: "Note Settings",
		noteLabel: "Note Content",
		modalClose: "Close modal",
		onlineStatus: "Online",
		offlineStatus: "Offline",
		storageUsage: "Using {percentage}% of available storage",
		databaseError: "Database error. Some features may not work properly.",
		fileTooLarge: "File is too large to save offline",
		fileReadError: "Failed to read file",
		cleanupError: "Error during cleanup",
		loading: "Loading...",
		noEventsToday: "No events today",
		addAttachment: "Add attachment",
		attachmentSaved: "Attachment saved",
		attachmentError: "Failed to save attachment",
		noteSaved: "Note saved",
		noteUpdated: "Note updated",
		syncProgress: "Sync in progress...",
		syncCompleted: "Sync completed",
		syncFailed: "Sync failed",
		offlineMessage: "Offline - data unavailable",
		offlineBadge: "Offline",
		themeToggle: "Toggle Dark Mode",
		searchPlaceholder: "Search notes...",
		exportButton: "Export PDF",
		navigation: {
			scrollUp: "Scroll up",
			scrollDown: "Scroll down",
			tipCount: "Tip {current} of {total}"
		},
		descriptionLabel: "Description", // For the "📝" label
		frequencyLabel: "Frequency",     // For the "⏰" label
		time: "Time"
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
		],
		back: "رجوع",
		delai: "التكرار",
		offlineSave: "تم حفظ الملاحظة بدون اتصال. سيتم المزامنة عند الاتصال",
		backgroundSync: "مزامنة الخلفية نشطة",
		periodicUpdate: "تم تفعيل التحديثات اليومية",
		notesReminder: "لديك {count} ملاحظات لليوم",
		dailyTip: "لا نصائح اليوم",
		noTipToday: "لا ملاحظات اليوم",
		noNotesToday: "لا ملاحظات اليوم",
		sanitizeWarning: "ملاحظة: تم تنظيف الأحرف الخاصة تلقائيًا",
		validationErrorText: "الرجاء إدخال نص الملاحظة",
		edit: "عدل",
		noteSettings: "إعدادات الملاحظة",
		noteLabel: "محتويات الملاحظة",
		modalClose: "إغلاق النافذة",
		onlineStatus: "متصل بالإنترنت",
		offlineStatus: "غير متصل",
		storageUsage: "يتم استخدام {percentage}٪ من مساحة التخزين المتاحة",
		databaseError: "خطأ في قاعدة البيانات. بعض الميزات قد لا تعمل بشكل صحيح.",
		fileTooLarge: "الملف كبير جدًا ولا يمكن حفظه دون اتصال",
		fileReadError: "فشل قراءة الملف",
		cleanupError: "خطأ أثناء التنظيف",
		noteSettings: "إعدادات الملاحظة",
		noteLabel: "محتويات الملاحظة",
		modalClose: "إغلاق النافذة",
		onlineStatus: "متصل بالإنترنت",
		offlineStatus: "غير متصل",
		storageUsage: "يتم استخدام {percentage}٪ من مساحة التخزين المتاحة",
		databaseError: "خطأ في قاعدة البيانات. بعض الميزات قد لا تعمل بشكل صحيح.",
		fileTooLarge: "الملف كبير جدًا ولا يمكن حفظه دون اتصال",
		fileReadError: "فشل قراءة الملف",
		cleanupError: "خطأ أثناء التنظيف",
		loading: "جاري التحميل...",
		noEventsToday: "لا توجد أحداث اليوم",
		addAttachment: "إضافة مرفق",
		attachmentSaved: "تم حفظ المرفق",
		attachmentError: "فشل حفظ المرفق",
		noteSaved: "تم حفظ الملاحظة",
		noteUpdated: "تم تحديث الملاحظة",
		syncProgress: "جاري المزامنة...",
		syncCompleted: "تمت المزامنة",
		syncFailed: "فشلت المزامنة",
		offlineMessage: "غير متصل - البيانات غير متوفرة",
		offlineBadge: "غير متصل",
		themeToggle: "تبديل الوضع المظلم", 
		searchPlaceholder: "ابحث في الملاحظات...",
		exportButton: "تصدير PDF",
		navigation: {
			scrollUp: "التمرير لأعلى",
			scrollDown: "التمرير لأسفل",
			tipCount: "النصيحة {current} من {total}"
		},
		descriptionLabel: "الوصف",
		frequencyLabel: "التكرار",
		time: "وقت"
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
		],
		back: "Retour",
		delai: "Fréquence",
		offlineSave: "Note sauvegardée hors ligne. Synchronisation automatique",
		backgroundSync: "Synchronisation en arrière-plan activée",
		periodicUpdate: "Mises à jour quotidiennes activées",
		notesReminder: "T'as {count} notes pour aujourd'hui",
		dailyTip: "Conseil Quotidien",
		noTipToday: "Pas des tips aujourd'hui",
		noNotesToday: "Pas des notes aujourd'hui",
		sanitizeWarning: "Remarque : Les caractères spéciaux ont été nettoyés automatiquement",
		validationErrorText: "Veuillez saisir le texte de la note",
		edit: "modifier",
		noteSettings: "Paramètres de note",
		noteLabel: "Contenu de la note",
		modalClose: "Fermer la fenêtre",
		onlineStatus: "En ligne",
		offlineStatus: "Hors ligne",
		storageUsage: "Utilisation de {percentage}% du stockage disponible",
		databaseError: "Erreur de base de données. Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
		fileTooLarge: "Le fichier est trop volumineux pour être enregistré hors ligne",
		fileReadError: "Échec de lecture du fichier",
		cleanupError: "Erreur lors du nettoyage",
		noteSettings: "Paramètres de note",
		noteLabel: "Contenu de la note",
		modalClose: "Fermer la fenêtre",
		onlineStatus: "En ligne",
		offlineStatus: "Hors ligne",
		storageUsage: "Utilisation de {percentage}% du stockage disponible",
		databaseError: "Erreur de base de données. Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
		fileTooLarge: "Le fichier est trop volumineux pour être enregistré hors ligne",
		fileReadError: "Échec de lecture du fichier",
		cleanupError: "Erreur lors du nettoyage",
		loading: "Chargement...",
		noEventsToday: "Aucun événement aujourd'hui",
		addAttachment: "Ajouter une pièce jointe",
		attachmentSaved: "Pièce jointe enregistrée",
		attachmentError: "Échec de l'enregistrement de la pièce jointe",
		noteSaved: "Note enregistrée",
		noteUpdated: "Note mise à jour",
		syncProgress: "Synchronisation en cours...",
		syncCompleted: "Synchronisation terminée",
		syncFailed: "Échec de la synchronisation",
		offlineMessage: "Hors ligne - données non disponibles",
		offlineBadge: "Hors ligne",
		themeToggle: "Basculer en mode sombre",
		searchPlaceholder: "Rechercher des notes...",
		exportButton: "Exporter PDF",
		navigation: {
			scrollUp: "Défiler vers le haut",
			scrollDown: "Défiler vers le bas",
			tipCount: "Astuce {current} sur {total}"
		},
		descriptionLabel: "Descrption",
		frequencyLabel: "Fréquence",
		time: "Heure"
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