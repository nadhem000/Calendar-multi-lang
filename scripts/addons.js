
// Addons data structure
let currentCategory = null;
const iconTips = {
	en: {
		health: [
			{
				id: "tip1",
				name: "Daily Exercise",
				description: "30 minutes of moderate exercise daily",
				delai: "Everyday"
			},
			{
				id: "tip2",
				name: "Water Intake",
				description: "Drink at least 8 glasses of water daily",
				delai: "Ongoing"
			},
			{
				id: "tip3",
				name: "Sleep Schedule",
				description: "Aim for 7-8 hours of quality sleep each night",
				delai: "Nightly"
			},
			{
				id: "tip4",
				name: "Healthy Snacks",
				description: "Choose fruits or nuts instead of junk food",
				delai: "Ongoing"
			},
			{
				id: "tip5",
				name: "Stretching",
				description: "Stretch every morning to improve flexibility",
				delai: "Morning"
			},
			{
				id: "tip6",
				name: "Limit Screen Time",
				description: "Reduce screen time before bed to improve sleep",
				delai: "Evening"
			},
			{
				id: "tip7",
				name: "Regular Check-ups",
				description: "Visit your doctor for annual health screenings",
				delai: "Annually"
			},
			{
				id: "tip8",
				name: "Mindfulness",
				description: "Practice meditation or deep breathing daily",
				delai: "Daily"
			},
			{
				id: "tip9",
				name: "Proper Posture",
				description: "Maintain good posture during work and rest",
				delai: "Ongoing"
			},
			{
				id: "tip10",
				name: "Limit Sugar Intake",
				description: "Reduce added sugars in your diet",
				delai: "Ongoing"
			}
		],
		plate: [
			{
				id: "tip1",
				name: "Balanced Diet",
				description: "Include vegetables in every meal",
				delai: "Lunch/Dinner"
			},
			{
				id: "tip2",
				name: "Portion Control",
				description: "Use smaller plates to avoid overeating",
				delai: "Ongoing"
			},
			{
				id: "tip3",
				name: "Whole Grains",
				description: "Choose whole grains over refined grains",
				delai: "Every Meal"
			},
			{
				id: "tip4",
				name: "Limit Processed Foods",
				description: "Avoid processed and fast foods as much as possible",
				delai: "Ongoing"
			},
			{
				id: "tip5",
				name: "Healthy Fats",
				description: "Incorporate sources of healthy fats like avocados and nuts",
				delai: "Ongoing"
			},
			{
				id: "tip6",
				name: "Eat Protein-Rich Foods",
				description: "Include lean meats, beans, or tofu in meals",
				delai: "Every Meal"
			},
			{
				id: "tip7",
				name: "Limit Salt",
				description: "Reduce salt intake to maintain healthy blood pressure",
				delai: "Ongoing"
			},
			{
				id: "tip8",
				name: "Eat Mindfully",
				description: "Focus on eating slowly and savoring each bite",
				delai: "Meal Times"
			},
			{
				id: "tip9",
				name: "Include Fruits",
				description: "Add a variety of fruits daily for vitamins and fiber",
				delai: "Everyday"
			},
			{
				id: "tip10",
				name: "Stay Hydrated During Meals",
				description: "Drink water with meals to aid digestion",
				delai: "Meal Times"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "Oil Check",
				description: "Check engine oil monthly",
				delai: "Monthly"
			},
			{
				id: "tip2",
				name: "Tire Pressure",
				description: "Inspect tire pressure weekly to ensure safety",
				delai: "Weekly"
			},
			{
				id: "tip3",
				name: "Brake Inspection",
				description: "Have brakes checked every 6 months",
				delai: "Semi-Annually"
			},
			{
				id: "tip4",
				name: "Coolant Level",
				description: "Check coolant levels before long trips",
				delai: "Monthly"
			},
			{
				id: "tip5",
				name: "Battery Health",
				description: "Test battery health annually",
				delai: "Annually"
			},
			{
				id: "tip6",
				name: "Lights Check",
				description: "Ensure all lights are functioning properly",
				delai: "Monthly"
			},
			{
				id: "tip7",
				name: "Air Filter Replacement",
				description: "Replace air filter every 12,000 miles or as needed",
				delai: "Annually or as needed"
			},
			{
				id: "tip8",
				name: "Fluid Levels",
				description: "Check transmission and brake fluid regularly",
				delai: "Monthly"
			},
			{
				id: "tip9",
				name: "Wiper Blades",
				description: "Replace wiper blades annually for clear visibility",
				delai: "Annually"
			},
			{
				id: "tip10",
				name: "Alignment Check",
				description: "Have wheel alignment checked if you notice uneven tire wear",
				delai: "As needed"
			}
		]
	},
	ar: {
		health: [
			{
				id: "tip1",
				name: "تمارين يومية",
				description: "30 دقيقة من التمارين المعتدلة يومياً",
				delai: "يومياً"
			},
			{
				id: "tip2",
				name: "شرب الماء",
				description: "شرب على الأقل 8 أكواب من الماء يومياً",
				delai: "مستمر"
			},
			{
				id: "tip3",
				name: "جدول النوم",
				description: "الحصول على 7-8 ساعات من النوم الجيد كل ليلة",
				delai: "ليلياً"
			},
			{
				id: "tip4",
				name: "وجبات خفيفة صحية",
				description: "اختيار الفواكه أو المكسرات بدلاً من الأطعمة الجاهزة",
				delai: "مستمر"
			},
			{
				id: "tip5",
				name: "تمارين التمدد",
				description: "تمدد صباحي لتحسين اللياقة والمرونة",
				delai: "الصباح"
			},
			{
				id: "tip6",
				name: "تقليل وقت الشاشة",
				description: "تقليل استخدام الأجهزة قبل النوم لتحسين جودة النوم",
				delai: "مساءً"
			},
			{
				id: "tip7",
				name: "الفحوصات الدورية",
				description: "زيارة الطبيب للفحوصات الصحية السنوية",
				delai: "سنوي"
			},
			{
				id: "tip8",
				name: "الوعي الذهني",
				description: "ممارسة التأمل أو التنفس العميق يومياً",
				delai: "يومي"
			},
			{
				id: "tip9",
				name: "تصحيح الوضعية",
				description: "الحفاظ على وضعية جسم سليمة أثناء العمل والراحة",
				delai: "مستمر"
			},
			{
				id: "tip10",
				name: "تقليل السكر",
				description: "خفض استهلاك السكريات المضافة في النظام الغذائي",
				delai: "مستمر"
			}
		],
		plate: [
			{
				id: "tip1",
				name: "نظام غذائي متوازن",
				description: "تضمين الخضروات في كل وجبة",
				delai: "الغداء/العشاء"
			},
			{
				id: "tip2",
				name: "التحكم في الحصص",
				description: "استخدام أطباق أصغر لتجنب الإفراط في الأكل",
				delai: "مستمر"
			},
			{
				id: "tip3",
				name: "حبوب كاملة",
				description: "اختيار الحبوب الكاملة بدلاً من المكررة",
				delai: "كل وجبة"
			},
			{
				id: "tip4",
				name: "تقليل الأطعمة المصنعة",
				description: "تجنب الأطعمة السريعة والمعالجة قدر الإمكان",
				delai: "مستمر"
			},
			{
				id: "tip5",
				name: "الدهون الصحية",
				description: "إضافة مصادر الدهون الصحية مثل الأفوكادو والمكسرات",
				delai: "مستمر"
			},
			{
				id: "tip6",
				name: "تناول البروتين",
				description: "إضافة اللحوم الخالية من الدهون أو البقوليات أو التوفو للوجبات",
				delai: "كل وجبة"
			},
			{
				id: "tip7",
				name: "الحد من الصوديوم",
				description: "تقليل كمية الملح لمنع ارتفاع ضغط الدم",
				delai: "مستمر"
			},
			{
				id: "tip8",
				name: "تناول الطعام بوعي",
				description: "تناول الطعام ببطء والتركيز على الطعم والملمس",
				delai: "مواعيد الوجبات"
			},
			{
				id: "tip9",
				name: "إضافة الفواكه",
				description: "تناول مجموعة متنوعة من الفواكه يومياً للحصول على الفيتامينات والألياف",
				delai: "يوميًا"
			},
			{
				id: "tip10",
				name: "الترطيب مع الوجبات",
				description: "شرب الماء مع الوجبات للمساعدة على الهضم",
				delai: "مواعيد الوجبات"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "فحص الزيت",
				description: "فحص زيت المحرك شهرياً",
				delai: "شهرياً"
			},
			{
				id: "tip2",
				name: "ضغط الإطارات",
				description: "فحص ضغط الإطارات أسبوعياً لضمان السلامة",
				delai: "أسبوعياً"
			},
			{
				id: "tip3",
				name: "فحص الفرامل",
				description: "فحص الفرامل كل 6 أشهر",
				delai: "نصف سنوي"
			},
			{
				id: "tip4",
				name: "مستوى المبرد",
				description: "فحص مستوى المبرد قبل الرحلات الطويلة",
				delai: "شهرياً"
			},
			{
				id: "tip5",
				name: "حالة البطارية",
				description: "اختبار صحة البطارية سنوياً",
				delai: "سنوي"
			},
			{
				id: "tip6",
				name: "فحص الأضواء",
				description: "تأكد من عمل جميع الأضواء بشكل صحيح",
				delai: "شهرياً"
			},
			{
				id: "tip7",
				name: "تغيير فلتر الهواء",
				description: "تغيير فلتر الهواء كل 12,000 ميل أو حسب الحاجة",
				delai: "سنوي أو حسب الحاجة"
			},
			{
				id: "tip8",
				name: "مستويات السوائل",
				description: "فحص سوائل ناقل الحركة والفرامل بانتظام",
				delai: "شهرياً"
			},
			{
				id: "tip9",
				name: "مساحات الزجاج",
				description: "استبدال مساحات الزجاج سنوياً لضمان وضوح الرؤية",
				delai: "سنوي"
			},
			{
				id: "tip10",
				name: "توازن العجلات",
				description: "فحص توازن العجلات إذا لاحظت تآكل غير متساوٍ للإطارات",
				delai: "حسب الحاجة"
			}
		]
	},
	fr: {
		health: [
			{
				id: "tip1",
				name: "Exercice Quotidien",
				description: "30 minutes d'exercice modéré par jour",
				delai: "Quotidien"
			},
			{
				id: "tip2",
				name: "Hydratation",
				description: "Boire au moins 8 verres d'eau par jour",
				delai: "Continu"
			},
			{
				id: "tip3",
				name: "Routine de Sommeil",
				description: "Dormir 7-8 heures de sommeil réparateur chaque nuit",
				delai: "Nuit"
			},
			{
				id: "tip4",
				name: "Collations Saines",
				description: "Choisir des fruits ou des noix plutôt que des aliments transformés",
				delai: "Continu"
			},
			{
				id: "tip5",
				name: "Étirements Matinaux",
				description: "Faire des étirements chaque matin pour améliorer la flexibilité",
				delai: "Matin"
			},
			{
				id: "tip6",
				name: "Réduire le Temps d'Écran",
				description: "Limiter l'utilisation des écrans avant le coucher pour mieux dormir",
				delai: "Soir"
			},
			{
				id: "tip7",
				name: "Contrôles Médicaux",
				description: "Consulter votre médecin pour des bilans de santé annuels",
				delai: "Annuel"
			},
			{
				id: "tip8",
				name: "Pratique de la Pleine Conscience",
				description: "Méditer ou faire des exercices de respiration profonde chaque jour",
				delai: "Quotidien"
			},
			{
				id: "tip9",
				name: "Bonne Posture",
				description: "Maintenir une bonne posture lors du travail et du repos",
				delai: "Continu"
			},
			{
				id: "tip10",
				name: "Réduction du Sucre",
				description: "Limiter la consommation de sucres ajoutés dans votre alimentation",
				delai: "Continu"
			}
		],
		plate: [
			{
				id: "tip1",
				name: "Régime Équilibré",
				description: "Inclure des légumes à chaque repas",
				delai: "Déjeuner/Dîner"
			},
			{
				id: "tip2",
				name: "Contrôle des Portions",
				description: "Utiliser des petites assiettes pour éviter de trop manger",
				delai: "Continu"
			},
			{
				id: "tip3",
				name: "Céréales Complètes",
				description: "Privilégier les céréales complètes plutôt que raffinées",
				delai: "Tous les repas"
			},
			{
				id: "tip4",
				name: "Réduction des Aliments Transformés",
				description: "Éviter autant que possible la nourriture rapide et transformée",
				delai: "Continu"
			},
			{
				id: "tip5",
				name: "Sources de Bonnes Graisses",
				description: "Intégrer des sources de bonnes graisses comme l'avocat ou les noix",
				delai: "Continu"
			},
			{
				id: "tip6",
				name: "Protéines",
				description: "Inclure des protéines maigres comme le poulet, le poisson ou les légumineuses",
				delai: "Tous les repas"
			},
			{
				id: "tip7",
				name: "Réduction du Sel",
				description: "Diminuer la consommation de sel pour contrôler la pression artérielle",
				delai: "Continu"
			},
			{
				id: "tip8",
				name: "Manger en pleine conscience",
				description: "Manger lentement et savourer chaque bouchée",
				delai: "Repas"
			},
			{
				id: "tip9",
				name: "Fruits Quotidiens",
				description: "Consommer une variété de fruits chaque jour",
				delai: "Quotidien"
			},
			{
				id: "tip10",
				name: "Hydratation pendant les repas",
				description: "Boire de l'eau avec les repas pour faciliter la digestion",
				delai: "Repas"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "Vérification d'Huile",
				description: "Vérifier l'huile moteur mensuellement",
				delai: "Mensuel"
			},
			{
				id: "tip2",
				name: "Pression des Pneus",
				description: "Vérifier la pression des pneus chaque semaine",
				delai: "Hebdomadaire"
			},
			{
				id: "tip3",
				name: "Inspection des Freins",
				description: "Faire vérifier les freins tous les 6 mois",
				delai: "Semi-annuel"
			},
			{
				id: "tip4",
				name: "Niveau de Liquide de Refroidissement",
				description: "Vérifier avant de longs trajets",
				delai: "Mensuel"
			},
			{
				id: "tip5",
				name: "État de la Batterie",
				description: "Tester la batterie une fois par an",
				delai: "Annuel"
			},
			{
				id: "tip6",
				name: "Vérification des Phare",
				description: "S'assurer que toutes les lumières fonctionnent correctement",
				delai: "Mensuel"
			},
			{
				id: "tip7",
				name: "Changement du Filtre à Air",
				description: "Remplacer le filtre à air tous les 20 000 km ou selon besoin",
				delai: "Annuel ou selon besoin"
			},
			{
				id: "tip8",
				name: "Niveaux de Liquides",
				description: "Vérifier régulièrement les liquides de transmission et de frein",
				delai: "Mensuel"
			},
			{
				id: "tip9",
				name: "Nettoyage des Balais d'Essuie-Glace",
				description: "Remplacer une fois par an pour une meilleure visibilité",
				delai: "Annuel"
			},
			{
				id: "tip10",
				name: "Alignement des Roues",
				description: "Faire contrôler si vous constatez une usure inégale des pneus",
				delai: "Selon besoin"
			}
		]
	}
};

// Modal management
function showTipsModal(category) {
    currentCategory = category;
    const modal = document.getElementById('tips-modal');
    const tips = iconTips[currentLanguage][category] || [];
    const langData = translations[currentLanguage];
    
    // Emoji mapping for categories
    const categoryEmojis = {
        health: '❤️🏥💊',
        plate: '🍽️🥗🍎',
        mechanics: '⚙️🔧🚗'
    };
    
    // Color schemes for categories
    const categoryColors = {
        health: { bg: '#fee2e2', text: '#dc2626' },
        plate: { bg: '#dcfce7', text: '#16a34a' },
        mechanics: { bg: '#dbeafe', text: '#2563eb' }
    };
    
    modal.innerHTML = `
<div class="tips-modal-content tip-category-${category}">
    <div class="tips-modal-header">
        <h3>${categoryEmojis[category].slice(0, 2)} 
        ${translations[currentLanguage].icons[category]}</h3>
        <button class="close-tips-modal" aria-label="${langData.modalClose}">×</button>
    </div>
    <div class="tips-navigation">
        <div class="category-icons">
            ${Object.entries(categoryEmojis).map(([cat, emoji]) => `
            <div class="category-icon" 
                 data-category="${cat}"
                 data-tooltip="${translations[currentLanguage].icons[cat]}">
                ${emoji.slice(0,1)}
            </div>
            `).join('')}
        </div>
        
        <div class="scroll-controls">
            <button class="scroll-up" aria-label="${langData.navigation?.scrollUp || 'Scroll up'}">↑</button>
            <button class="scroll-down" aria-label="${langData.navigation?.scrollDown || 'Scroll down'}">↓</button>
        </div>
        
        <div class="tips-list-container">
            <div class="tips-list">
                ${tips.map((tip, index) => `
                <div class="tip-item" data-id="${tip.id}">
                    <div class="tip-emoji">${String.fromCodePoint(0x1f4ac + index)}</div>
                    <h4>${tip.name}</h4>
                    <p class="tip-delai">⏳ ${translations[currentLanguage].delai}: ${tip.delai}</p>
                    <div class="tip-counter">${index + 1}/${tips.length}</div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
</div>
`;
    
    // Add scroll functionality
    const tipsContainer = modal.querySelector('.tips-list-container');
    const tipItems = modal.querySelectorAll('.tip-item');
    const scrollUpBtn = modal.querySelector('.scroll-up');
    const scrollDownBtn = modal.querySelector('.scroll-down');
    
    // Scroll to specific tip
    function scrollToTip(index) {
        if (index >= 0 && index < tipItems.length) {
            tipItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Navigation buttons
    scrollUpBtn.addEventListener('click', () => {
        tipsContainer.scrollBy({ top: -100, behavior: 'smooth' });
    });
    
    scrollDownBtn.addEventListener('click', () => {
        tipsContainer.scrollBy({ top: 100, behavior: 'smooth' });
    });
    
    // Keyboard navigation
    tipsContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            tipsContainer.scrollBy({ top: -50, behavior: 'smooth' });
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            tipsContainer.scrollBy({ top: 50, behavior: 'smooth' });
        }
    });
    
    // Add click handlers for tips
    tipItems.forEach((item, index) => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'translateX(5px)';
            item.style.boxShadow = '2px 2px 8px rgba(0,0,0,0.1)';
        });
        item.addEventListener('mouseout', () => {
            item.style.transform = 'none';
            item.style.boxShadow = 'none';
        });
        item.addEventListener('click', () => showTipDetail(category, item.dataset.id));
        item.setAttribute('tabindex', '0'); // Make tips focusable for keyboard navigation
    });
    
    modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  modal.querySelector('.close-tips-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });
    
  
    modal.style.display = 'block';
}

function showTipDetail(category, tipId) {
	const tip = iconTips[currentLanguage][category].find(t => t.id === tipId);
	const modal = document.getElementById('tips-modal');
	const categoryColors = {
		health: { bg: '#fee2e2', text: '#dc2626' },
		plate: { bg: '#dcfce7', text: '#16a34a' },
		mechanics: { bg: '#dbeafe', text: '#2563eb' }
	};
	
	modal.innerHTML = `
    <div class="tips-modal-content" style="border-color: ${categoryColors[category].text}">
	<div class="tips-modal-header">
	<h3 style="color: ${categoryColors[category].text}">
	${translations[currentLanguage].icons[category]}
	</h3>
	<button class="close-tips-modal" style="
	background: ${categoryColors[category].text};
	color: white;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	font-size: 1.5rem;
	border: none;
	">×</button>
	</div>
	<div class="tip-detail" style="background: ${categoryColors[category].bg}">
	<div class="detail-icon">💡</div>
	<h2 style="color: ${categoryColors[category].text}">${tip.name}</h2>
	<div class="tip-content">
	<p class="tip-description">📝 ${tip.description}</p>
	<p class="tip-delai">⏰ ${translations[currentLanguage].delai}: ${tip.delai}</p>
	</div>
	<button class="back-to-list" style="
	background: ${categoryColors[category].text};
	color: white;
	padding: 8px 16px;
	border-radius: 20px;
	border: none;
	">
	↩️ ${translations[currentLanguage].back}
	</button>
	</div>
    </div>
	`;
	
	modal.querySelector('.back-to-list').addEventListener('click', () => showTipsModal(category));
	modal.querySelector('.close-tips-modal').addEventListener('click', () => {
		modal.style.display = 'none';
	});
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Initialize modal close handlers
document.addEventListener('click', (e) => {
	if (e.target.closest('.tip-item')) {
		const item = e.target.closest('.tip-item');
		showTipDetail(currentCategory, item.dataset.id);
	}
});
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		const modal = document.getElementById('tips-modal');
		modal.style.display = 'none';
	}
});