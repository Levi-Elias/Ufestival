document.addEventListener('DOMContentLoaded', () => {
    const infoContainer = document.getElementById('info-accordion-container');
    let infoData = [];

    // Icon map per section id
    const ICONS = {
        general:       '📋',
        accessibility: '🚲',
        rules:         '📜',
        faq:           '❓'
    };

    // Fetch data
    fetch('./data/info.json')
        .then(response => response.json())
        .then(data => {
            infoData = data;
            renderAccordions();
        })
        .catch(err => console.error("Error loading info data:", err));

    // Listen to language changes to re-render content
    document.addEventListener('languageChanged', () => {
        if (infoData.length > 0) {
            renderAccordions();
        }
    });

    function renderAccordions() {
        if (!infoContainer) return;

        const lang = window.i18n ? window.i18n.getCurrentLang() : 'nl';

        // Remember which item is open
        const openId = infoContainer.querySelector('.accordion-header.active')
            ?.closest('.accordion-item')?.dataset.id || (infoData[0]?.id);

        infoContainer.innerHTML = '';

        infoData.forEach((item) => {
            const isOpen = item.id === openId;

            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.dataset.id = item.id;

            // Header
            const header = document.createElement('button');
            header.className = `accordion-header${isOpen ? ' active' : ''}`;

            // Icon bubble
            const iconBubble = document.createElement('span');
            iconBubble.className = 'accordion-header-icon';
            iconBubble.textContent = ICONS[item.id] || 'ℹ️';

            // Title
            const titleSpan = document.createElement('span');
            titleSpan.className = 'accordion-title';
            titleSpan.textContent = item.title[lang];

            // Chevron
            const chevron = document.createElement('span');
            chevron.className = 'accordion-icon';
            chevron.innerHTML = '&#9654;'; // ▶ rotated by CSS when active

            header.appendChild(iconBubble);
            header.appendChild(titleSpan);
            header.appendChild(chevron);

            // Content
            const content = document.createElement('div');
            content.className = 'accordion-content';
            content.innerHTML = item.content[lang];

            accordionItem.appendChild(header);
            accordionItem.appendChild(content);
            infoContainer.appendChild(accordionItem);

            // Set maxHeight AFTER appending so scrollHeight is accurate
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }

            // Toggle on click
            header.addEventListener('click', () => {
                const isActive = header.classList.contains('active');

                // Close all
                document.querySelectorAll('.accordion-header').forEach(h => {
                    h.classList.remove('active');
                    h.nextElementSibling.style.maxHeight = null;
                });

                if (!isActive) {
                    header.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }
});
