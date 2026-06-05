const translations = {
    nl: {
        "nav_home": "Home",
        "nav_info": "Info",
        "nav_lineup": "Rooster",
        "nav_map": "Kaart",
        "home_welcome": "WELKOM BIJ U FESTIVAL",
        "home_subtitle": "Beleef de ultieme festival ervaring.",
        "stage_ponton": "Ponton",
        "stage_lake": "De Lake",
        "stage_club": "De Club",
        "stage_hangar": "Hangar",
        "tab_saturday": "Zaterdag",
        "tab_sunday": "Zondag",
        "modal_stage_label": "Podium",
        "modal_fav_add": "♡ Voeg toe aan favorieten",
        "modal_fav_remove": "❤️ Verwijder uit favorieten",
        "no_acts_stage": "Geen optredens gevonden voor dit podium.",
        "gps_error": "Kan locatie niet ophalen. Controleer of je locatie-toegang hebt gegeven.",
        "news_today": "Vandaag op het podium",
        "news_no_acts": "Geen optredens vandaag",
        "news_all_acts": "Optredens dit weekend",
        "news_stage_label": "Podium",
        "news_day_saturday": "Zaterdag",
        "news_day_sunday": "Zondag",
        "install_title": "Download de app",
        "install_desc": "Scan de QR-code met je telefoon om de app te openen en te installeren.",
        "install_hint": "Werkt op iOS (Safari) en Android (Chrome)"
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
        "stage_hangar": "Hangar",
        "tab_saturday": "Saturday",
        "tab_sunday": "Sunday",
        "modal_stage_label": "Stage",
        "modal_fav_add": "♡ Add to favourites",
        "modal_fav_remove": "❤️ Remove from favourites",
        "no_acts_stage": "No acts found for this stage.",
        "gps_error": "Could not get your location. Please check that you have granted location access.",
        "news_today": "Today on stage",
        "news_no_acts": "No acts today",
        "news_all_acts": "Acts this weekend",
        "news_stage_label": "Stage",
        "news_day_saturday": "Saturday",
        "news_day_sunday": "Sunday",
        "install_title": "Download the app",
        "install_desc": "Scan the QR code with your phone to open and install the app.",
        "install_hint": "Works on iOS (Safari) and Android (Chrome)"
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
        langBtn.textContent = 'en';
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
