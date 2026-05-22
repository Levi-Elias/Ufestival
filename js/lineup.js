document.addEventListener('DOMContentLoaded', () => {
    const saturdayBtn = document.getElementById('tab-saturday');
    const sundayBtn = document.getElementById('tab-sunday');
    const scheduleGrid = document.getElementById('schedule-grid');
    
    // Modal elements
    const modal = document.getElementById('artist-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalDesc = document.getElementById('modal-desc');
    const modalStageTime = document.getElementById('modal-stage-time');
    const modalFavBtn = document.getElementById('modal-fav-btn');

    let lineupData = [];
    let currentDay = 'saturday'; // default day

    const stages = ['ponton', 'club', 'lake', 'hangar'];
    const startTime = 10 * 60; // 10:00 in minutes
    const endTime = 23 * 60 + 45; // 23:45 in minutes

    // Fetch data
    fetch('./data/lineup.json')
        .then(response => response.json())
        .then(data => {
            lineupData = data;
            renderSchedule(currentDay);
        })
        .catch(err => console.error("Error loading lineup data:", err));

    // Tab switching
    saturdayBtn.addEventListener('click', () => {
        currentDay = 'saturday';
        saturdayBtn.classList.add('active');
        sundayBtn.classList.remove('active');
        renderSchedule(currentDay);
    });

    sundayBtn.addEventListener('click', () => {
        currentDay = 'sunday';
        sundayBtn.classList.add('active');
        saturdayBtn.classList.remove('active');
        renderSchedule(currentDay);
    });

    // Language change listener to re-render descriptions
    document.addEventListener('languageChanged', () => {
        if(lineupData.length > 0) {
            renderSchedule(currentDay);
            // If modal is open, update it
            if (modal.classList.contains('active')) {
                const activeId = modal.getAttribute('data-active-id');
                if (activeId) {
                    const artist = lineupData.find(a => a.id === activeId);
                    if (artist) {
                        const lang = window.i18n ? window.i18n.getCurrentLang() : 'nl';
                        modalDesc.textContent = artist.description[lang];
                    }
                }
            }
        }
    });

    // Modal Close
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    function toggleFavorite(id) {
        let favs = getFavorites();
        if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
        } else {
            favs.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
    }

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function renderSchedule(day) {
        if (!scheduleGrid) return;
        scheduleGrid.innerHTML = '';
        
        const dayData = lineupData.filter(act => act.day === day);
        const favs = getFavorites();

        // Build grid structure
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'schedule-grid-wrapper';

        // Timeline header (10:00 - 23:00)
        const timelineRow = document.createElement('div');
        timelineRow.className = 'schedule-timeline';
        // Placeholder for the stage names column
        const emptyCorner = document.createElement('div');
        emptyCorner.className = 'timeline-corner';
        timelineRow.appendChild(emptyCorner);

        for (let hour = 10; hour <= 23; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'timeline-slot';
            timeSlot.textContent = `${hour}:00`;
            timelineRow.appendChild(timeSlot);
        }
        gridWrapper.appendChild(timelineRow);

        // Stages rows
        stages.forEach(stage => {
            const row = document.createElement('div');
            row.className = 'schedule-row';
            
            const stageLabel = document.createElement('div');
            stageLabel.className = 'stage-label';
            // Extract the name part for UI
            let displayName = stage;
            if (stage === 'ponton') displayName = 'Poton'; // as in design
            if (stage === 'club') displayName = 'Club';
            if (stage === 'lake') displayName = 'Lake';
            if (stage === 'hangar') displayName = 'Hangar';
            stageLabel.textContent = displayName;
            row.appendChild(stageLabel);

            const actsContainer = document.createElement('div');
            actsContainer.className = 'acts-container';

            // Background grid lines (one per hour = 4 quarters)
            for (let i = 0; i < 14; i++) {
                const bgLine = document.createElement('div');
                bgLine.className = 'bg-line';
                actsContainer.appendChild(bgLine);
            }

            // Find acts for this stage
            const stageActs = dayData.filter(act => act.stage === stage);
            stageActs.forEach(act => {
                const actBlock = document.createElement('div');
                actBlock.className = 'act-block-grid';
                
                const actStartMins = timeToMinutes(act.start);
                const actEndMins = timeToMinutes(act.end);
                
                // Calculate position percentages based on full timeline duration (14 hours = 840 mins)
                const durationMins = 14 * 60; 
                
                let startPercent = ((actStartMins - startTime) / durationMins) * 100;
                let widthPercent = ((actEndMins - actStartMins) / durationMins) * 100;
                
                actBlock.style.left = `${startPercent}%`;
                actBlock.style.width = `${widthPercent}%`;
                
                const actName = document.createElement('span');
                actName.textContent = act.name;
                actName.className = 'act-grid-name';
                
                const favIcon = document.createElement('span');
                favIcon.className = 'act-grid-fav';
                favIcon.innerHTML = favs.includes(act.id) ? '❤️' : '♡';
                
                favIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(act.id);
                    favIcon.innerHTML = getFavorites().includes(act.id) ? '❤️' : '♡';
                });

                actBlock.appendChild(actName);
                actBlock.appendChild(favIcon);
                
                actBlock.addEventListener('click', () => {
                    // Only open modal if there's an image or description beyond basic
                    // We'll open for all, but maybe empty image is handled
                    openModal(act);
                });

                actsContainer.appendChild(actBlock);
            });

            row.appendChild(actsContainer);
            gridWrapper.appendChild(row);
        });

        scheduleGrid.appendChild(gridWrapper);
    }

    function openModal(act) {
        const lang = window.i18n ? window.i18n.getCurrentLang() : 'nl';
        
        modalImg.src = act.image || './assets/logo_black.svg';
        if(!act.image) {
            modalImg.style.objectFit = 'contain';
            modalImg.style.padding = '20px';
        } else {
            modalImg.style.objectFit = 'cover';
            modalImg.style.padding = '0';
        }
        
        modalName.textContent = act.name;
        modalDesc.textContent = act.description[lang];
        modalStageTime.textContent = `Stage: ${act.stage.charAt(0).toUpperCase() + act.stage.slice(1)} | ${act.start} - ${act.end}`;
        
        modal.setAttribute('data-active-id', act.id);
        
        const favs = getFavorites();
        modalFavBtn.innerHTML = favs.includes(act.id) ? '❤️ Verwijder uit favorieten' : '♡ Voeg toe aan favorieten';
        
        // Remove old event listener and add a new one to avoid stacking
        modalFavBtn.replaceWith(modalFavBtn.cloneNode(true));
        const newFavBtn = document.getElementById('modal-fav-btn');
        
        newFavBtn.addEventListener('click', () => {
            toggleFavorite(act.id);
            const isFav = getFavorites().includes(act.id);
            newFavBtn.innerHTML = isFav ? '❤️ Verwijder uit favorieten' : '♡ Voeg toe aan favorieten';
            // Re-render schedule to update heart icons there too
            renderSchedule(currentDay);
        });

        modal.classList.add('active');
    }
});
