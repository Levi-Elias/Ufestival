const translations = {
    nl: {
        "nav_home": "Home",
        "nav_info": "Info",
        "nav_lineup": "Lineup",
        "nav_map": "Kaart",
        "home_welcome": "WELKOM BIJ U FESTIVAL",
        "home_subtitle": "Beleef de ultieme festival ervaring.",
        "stage_ponton": "Ponton",
        "stage_lake": "The Lake",
        "stage_club": "The Club",
        "stage_hangar": "Hangar"
    },
    en: {
        "nav_home": "Home",
        "nav_info": "Info",
        "nav_lineup": "Lineup",
        "nav_map": "Map",
        "home_welcome": "WELCOME TO U FESTIVAL",
        "home_subtitle": "Experience the ultimate festival vibe.",
        "stage_ponton": "Ponton",
        "stage_lake": "The Lake",
        "stage_club": "The Club",
        "stage_hangar": "Hangar"
    }
};

let currentLang = localStorage.getItem('language') || 'nl';

document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    
    // Set initial language
    setLanguage(currentLang);

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'nl' ? 'en' : 'nl';
        setLanguage(currentLang);
    });
});

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    const langBtn = document.getElementById('lang-toggle');
    
    // Update button text/icon
    if (lang === 'nl') {
        langBtn.textContent = '🇳🇱';
    } else {
        langBtn.textContent = '🇬🇧';
    }

    // Update all translatable elements
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Check if it's a placeholder or text content
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
    
    // Dispatch custom event for other scripts that might need to react to language changes
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
}

// Export for other modules if needed, or make it globally available
window.i18n = {
    get: (key) => {
        return translations[currentLang][key] || key;
    },
    getCurrentLang: () => currentLang
};
