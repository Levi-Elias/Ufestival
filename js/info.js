document.addEventListener('DOMContentLoaded', () => {
    const infoContainer = document.getElementById('info-accordion-container');
    let infoData = [];

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
        if(infoData.length > 0) {
            renderAccordions();
        }
    });

    function renderAccordions() {
        if (!infoContainer) return;
        
        const lang = window.i18n ? window.i18n.getCurrentLang() : 'nl';
        infoContainer.innerHTML = '';

        infoData.forEach((item, index) => {
            const isFirst = index === 0; // Open the first one by default if desired

            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            
            const header = document.createElement('button');
            header.className = `accordion-header ${isFirst ? 'active' : ''}`;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'accordion-title';
            titleSpan.textContent = item.title[lang];
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'accordion-icon';
            iconSpan.innerHTML = isFirst ? '&#9660;' : '&#9654;'; // down/right triangle

            header.appendChild(titleSpan);
            header.appendChild(iconSpan);

            const content = document.createElement('div');
            content.className = 'accordion-content';
            content.innerHTML = item.content[lang];
            if (isFirst) {
                content.style.maxHeight = content.scrollHeight + "px";
            }

            // Click event for accordion
            header.addEventListener('click', () => {
                const isActive = header.classList.contains('active');
                
                // Close all other accordions (optional, can be removed if multiple can be open)
                document.querySelectorAll('.accordion-header').forEach(h => {
                    h.classList.remove('active');
                    h.querySelector('.accordion-icon').innerHTML = '&#9654;';
                    h.nextElementSibling.style.maxHeight = null;
                });

                if (!isActive) {
                    header.classList.add('active');
                    iconSpan.innerHTML = '&#9660;';
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });

            accordionItem.appendChild(header);
            accordionItem.appendChild(content);
            infoContainer.appendChild(accordionItem);
        });
    }
});
