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

    // QR Code install modal
    const installBtn    = document.getElementById('install-btn');
    const installModal  = document.getElementById('install-modal');
    const installModalClose = document.getElementById('install-modal-close');
    const qrImg = document.getElementById('qr-code-img');

    // Detect platform to show the right step-2 instruction
    const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const iosSteps  = document.querySelectorAll('.install-ios');
    const droidSteps= document.querySelectorAll('.install-android');

    iosSteps.forEach(el   => el.style.display = isIOS ? 'inline' : 'none');
    droidSteps.forEach(el => el.style.display = isIOS ? 'none'   : 'inline');

    // Android: capture the native install prompt so we can trigger it later
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    function openInstallModal() {
        const pageUrl = encodeURIComponent(window.location.href);
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=000000&bgcolor=ffffff&data=${pageUrl}`;
        }
        if (installModal) installModal.classList.add('active');

        // On Android, also trigger the native install prompt if available
        if (!isIOS && deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
        }
    }

    function closeInstallModal() {
        if (installModal) installModal.classList.remove('active');
    }

    if (installBtn)         installBtn.addEventListener('click', openInstallModal);
    if (installModalClose)  installModalClose.addEventListener('click', closeInstallModal);
    if (installModal) {
        installModal.addEventListener('click', (e) => {
            if (e.target === installModal) closeInstallModal();
        });
    }
});
