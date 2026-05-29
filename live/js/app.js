document.addEventListener('DOMContentLoaded', () => {
    // Theme logic
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    
    // Check local storage for theme, or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update header logo based on theme
        const headerLogo = document.getElementById('header-logo-img');
        if (theme === 'dark') {
            themeBtn.textContent = '☀';
            if(headerLogo) headerLogo.src = 'assets/logo_black.svg'; // In dark mode, header is white, so use black logo
        } else {
            themeBtn.textContent = '🌙';
            if(headerLogo) headerLogo.src = 'assets/logo_white.svg'; // In light mode, header is black, so use white logo
        }
    }

    // Navigation logic (SPA)
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-target');
            
            // Update active states for nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active states for sections
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Scroll to top when changing tab
            window.scrollTo(0, 0);
        });
    });

    // PWA Install prompt handling (basic setup)
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
    });
});
