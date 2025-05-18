
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
			}
		],
		plate: [
			{
				id: "tip1",
				name: "Balanced Diet",
				description: "Include vegetables in every meal",
				delai: "Lunch/Dinner"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "Oil Check",
				description: "Check engine oil monthly",
				delai: "Monthly"
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
			}
		],
		plate: [
			{
				id: "tip1",
				name: "نظام غذائي متوازن",
				description: "تضمين الخضار في كل وجبة",
				delai: "الغداء/العشاء"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "فحص الزيت",
				description: "فحص زيت المحرك شهرياً",
				delai: "شهرياً"
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
			}
		],
		plate: [
			{
				id: "tip1",
				name: "Régime Équilibré",
				description: "Inclure des légumes à chaque repas",
				delai: "Déjeuner/Dîner"
			}
		],
		mechanics: [
			{
				id: "tip1",
				name: "Vérification d'Huile",
				description: "Vérifier l'huile moteur mensuellement",
				delai: "Mensuel"
			}
		]
	}
};

// Modal management
function showTipsModal(category) {
  currentCategory = category;
  const modal = document.getElementById('tips-modal');
  const tips = iconTips[currentLanguage][category] || [];
  
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
    <div class="tips-modal-content" style="border-color: ${categoryColors[category].text}">
      <div class="tips-modal-header">
        <h3 style="color: ${categoryColors[category].text}">
          ${categoryEmojis[category].slice(0, 2)} 
          ${translations[currentLanguage].icons[category]}
        </h3>
        <button class="close-tips-modal" style="
          background: ${categoryColors[category].text};
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          font-size: 1.5rem;
        ">×</button>
      </div>
      <div class="tips-list" style="background: ${categoryColors[category].bg}">
        ${tips.map((tip, index) => `
          <div class="tip-item" data-id="${tip.id}" style="
            border-left: 4px solid ${categoryColors[category].text};
            background: white;
            position: relative;
          ">
            <div class="tip-emoji">${String.fromCodePoint(0x1f4ac + index)}</div>
            <h4 style="color: ${categoryColors[category].text}">${tip.name}</h4>
            <p class="tip-delai">⏳ ${translations[currentLanguage].delai}: ${tip.delai}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Add click handlers and styling
  modal.querySelectorAll('.tip-item').forEach(item => {
    item.addEventListener('mouseover', () => {
      item.style.transform = 'translateX(5px)';
      item.style.boxShadow = '2px 2px 8px rgba(0,0,0,0.1)';
    });
    item.addEventListener('mouseout', () => {
      item.style.transform = 'none';
      item.style.boxShadow = 'none';
    });
    item.addEventListener('click', () => showTipDetail(category, item.dataset.id));
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