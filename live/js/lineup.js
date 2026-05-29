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

    // Drag to scroll logic for the grid
    let isDraggingGrid = false;
    let gridStartX;
    let gridScrollLeft;
    let hasDragged = false;

    scheduleGrid.addEventListener('mousedown', (e) => {
        isDraggingGrid = true;
        hasDragged = false;
        scheduleGrid.style.cursor = 'grabbing';
        gridStartX = e.pageX - scheduleGrid.offsetLeft;
        gridScrollLeft = scheduleGrid.scrollLeft;
    });

    scheduleGrid.addEventListener('mouseleave', () => {
        isDraggingGrid = false;
        scheduleGrid.style.cursor = 'grab';
    });

    scheduleGrid.addEventListener('mouseup', () => {
        isDraggingGrid = false;
        scheduleGrid.style.cursor = 'grab';
    });

    scheduleGrid.addEventListener('mousemove', (e) => {
        if (!isDraggingGrid) return;
        const x = e.pageX - scheduleGrid.offsetLeft;
        const walk = (x - gridStartX);
        if (Math.abs(walk) > 5) {
            hasDragged = true; // Mark as dragged if moved more than 5px
        }
        scheduleGrid.scrollLeft = gridScrollLeft - walk;
    });

    // Load data: prefer CMS localStorage data, fall back to lineup.json
    const CMS_KEY = 'ufestival_lineup_cms';

    function loadLineup() {
        const stored = localStorage.getItem(CMS_KEY);
        if (stored) {
            try {
                lineupData = JSON.parse(stored);
                renderSchedule(currentDay);
                return;
            } catch(e) {
                console.warn('CMS data corrupt, falling back to JSON file.');
            }
        }
        // Fallback: load from file
        fetch('./data/lineup.json')
            .then(response => response.json())
            .then(data => {
                lineupData = data;
                renderSchedule(currentDay);
            })
            .catch(err => console.error('Error loading lineup data:', err));
    }

    loadLineup();

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
            for (let min = 0; min < 60; min += 15) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'timeline-slot';
                if (min === 0) {
                    timeSlot.textContent = `${hour}:00`;
                    timeSlot.classList.add('hour-slot');
                } else {
                    timeSlot.textContent = `:${min}`;
                    timeSlot.classList.add('quarter-slot');
                }
                timelineRow.appendChild(timeSlot);
            }
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

            // Background grid lines (one per 15 mins)
            for (let i = 0; i < 14 * 4; i++) {
                const bgLine = document.createElement('div');
                bgLine.className = 'bg-line';
                if (i % 4 === 3) bgLine.classList.add('hour-line'); // The line at the end of the 4th quarter (xx:45 - xx+1:00) is the hour line
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
                
                actBlock.addEventListener('click', (e) => {
                    // Prevent opening modal if the user was just dragging the grid
                    if (hasDragged) {
                        e.preventDefault();
                        return;
                    }
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
        const currentLang = lang;
        const modalImageContainer = document.getElementById('modal-image-container');
        if (act.image) {
            modalImageContainer.innerHTML = `<img src="${act.image}" alt="${act.name}" class="modal-header-img">`;
        } else if (act.video) {
            modalImageContainer.innerHTML = `<div class="modal-video-container"><iframe src="${act.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        } else {
            modalImageContainer.innerHTML = `<div class="modal-header-placeholder"></div>`;
        }

        // Description
        const descEl = document.getElementById('modal-desc');
        // Add extra margin if there's a video AND an image, we can put video below description
        let videoHtml = '';
        if (act.video && act.image) {
            videoHtml = `<div class="modal-video-container" style="margin-top: 15px;"><iframe src="${act.video}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
        }
        
        descEl.innerHTML = act.description[currentLang] + videoHtml;
        modalStageTime.textContent = `Stage: ${act.stage.charAt(0).toUpperCase() + act.stage.slice(1)} | ${act.start} - ${act.end}`;
        
        modal.setAttribute('data-active-id', act.id);
        document.getElementById('modal-name').textContent = act.name;
        
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
