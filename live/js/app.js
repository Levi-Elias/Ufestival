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

    // PWA Install prompt handling
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    const installModal = document.getElementById('install-modal');
    const installModalBtn = document.getElementById('install-modal-btn');
    const installModalClose = document.getElementById('install-modal-close');
    const installModalCancel = document.getElementById('install-modal-cancel');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });

    // Show popup after 5 seconds (unconditionally so the user can test the design)
    setTimeout(() => {
        if (installModal) {
            installModal.classList.add('active');
        }
    }, 5000);

    const closeInstallModal = () => {
        if (installModal) {
            installModal.classList.remove('active');
        }
    };

    if (installModalClose) installModalClose.addEventListener('click', closeInstallModal);
    if (installModalCancel) installModalCancel.addEventListener('click', closeInstallModal);

    const performInstall = async () => {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
            // Hide the app provided install promotion
            if (installBtn) installBtn.style.display = 'none';
            closeInstallModal();
        } else {
            alert("Installatie via de browser is momenteel niet beschikbaar. Dit kan komen doordat de app al geïnstalleerd is, of omdat je de bestanden direct opent in plaats van via een lokale webserver (localhost).");
            closeInstallModal();
        }
    };

    if (installModalBtn) installModalBtn.addEventListener('click', performInstall);
    
    if (installBtn) {
        installBtn.addEventListener('click', performInstall);
    }
});
