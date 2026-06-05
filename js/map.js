document.addEventListener('DOMContentLoaded', () => {
    const mapViewport = document.getElementById('map-viewport');
    const transformContainer = document.getElementById('map-transform-container');
    const mapImg = document.getElementById('festival-map-img');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const gpsBtn = document.getElementById('gps-btn');
    const gpsDot = document.getElementById('gps-dot');

    if (!mapViewport || !transformContainer) return;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Minimum scale to fit image width
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    function updateTransform() {
        // Constrain translations to keep map in view (basic constraints)
        // This is a simplified constraint that works reasonably well
        const rect = mapViewport.getBoundingClientRect();
        const imgWidth = mapImg.clientWidth * scale;
        const imgHeight = mapImg.clientHeight * scale;

        // Prevent dragging image out of bounds
        const minX = Math.min(0, rect.width - imgWidth);
        const minY = Math.min(0, rect.height - imgHeight);

        translateX = Math.max(minX, Math.min(0, translateX));
        translateY = Math.max(minY, Math.min(0, translateY));

        transformContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // --- Button Zoom Controls ---
    zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale + 0.5, MAX_SCALE);
        updateTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale - 0.5, MIN_SCALE);
        // Reset translation if zooming all the way out
        if (scale === MIN_SCALE) {
            translateX = 0;
            translateY = 0;
        }
        updateTransform();
    });

    // --- Pointer Events for Dragging ---
    mapViewport.addEventListener('pointerdown', (e) => {
        // Don't start drag when clicking a control button
        if (e.target.closest('button')) return;

        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mapViewport.setPointerCapture(e.pointerId);
    });

    mapViewport.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    mapViewport.addEventListener('pointerup', (e) => {
        isDragging = false;
        mapViewport.releasePointerCapture(e.pointerId);
    });

    mapViewport.addEventListener('pointercancel', (e) => {
        isDragging = false;
    });

    // --- Pinch to Zoom (Touch Events) ---
    let initialPinchDistance = null;
    let initialScale = 1;

    mapViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isDragging = false; // Disable single finger drag
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = scale;
        }
    }, { passive: false });

    mapViewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault(); // Prevent page scroll
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            const distanceRatio = currentDistance / initialPinchDistance;
            scale = Math.max(MIN_SCALE, Math.min(initialScale * distanceRatio, MAX_SCALE));
            updateTransform();
        }
    }, { passive: false });

    mapViewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = null;
        }
    });

    // --- GPS Geolocation Logic ---
    let watchId = null;

    gpsBtn.addEventListener('click', () => {
        if (!('geolocation' in navigator)) {
            alert('Geolocatie wordt niet ondersteund door jouw browser.');
            return;
        }

        if (watchId !== null) {
            // Already active, let's stop it (toggle feature)
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            gpsDot.style.display = 'none';
            gpsBtn.style.color = 'var(--color-primary)';
            return;
        }

        // Request location
        gpsBtn.style.color = '#4285F4'; // Active state color

        watchId = navigator.geolocation.watchPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // In a real scenario, you need to map lat/lon bounds of the physical festival location 
            // to the X/Y pixel bounds of your kaart_festival_markers.svg.
            // For this demo, we'll place the dot in the center, or randomly, as an example.

            // DEMO: Place dot relatively in the center to show it works
            gpsDot.style.display = 'block';
            gpsDot.style.left = '50%';
            gpsDot.style.top = '50%';

            console.log(`GPS Location updated: ${lat}, ${lon}`);

            // To implement real mapping, you'd calculate percentages:
            // const mapLatMin = 52.0; const mapLatMax = 52.1;
            // const topPercent = ((mapLatMax - lat) / (mapLatMax - mapLatMin)) * 100;
            // gpsDot.style.top = `${topPercent}%`;

        }, (error) => {
            console.error('Error getting location:', error);
            alert(window.i18n ? window.i18n.get('gps_error') : 'Could not get your location.');
            gpsBtn.style.color = 'var(--color-primary)';
            watchId = null;
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    });

    // Make sure map starts cleanly sized
    window.addEventListener('resize', updateTransform);

    // --- Interactive Map Logic ---
    let lineupData = [];
    let currentOpenStage = null; // track which stage modal is open
    fetch('./data/lineup.json').then(res => res.json()).then(data => lineupData = data);

    // Re-render stage modal when language changes
    document.addEventListener('languageChanged', () => {
        if (currentOpenStage && document.getElementById('stage-modal').classList.contains('active')) {
            openStageModal(currentOpenStage);
        }
    });

    const stageImages = {
        'ponton': './assets/ponton.png',
        'lake': './assets/thelake.png',
        'club': './assets/theclub.png',
        'hangar': './assets/hangar.png'
    };

    document.querySelectorAll('.map-hotspot').forEach(hotspot => {
        // Prevent map dragging when clicking hotspot
        hotspot.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        });

        hotspot.addEventListener('click', (e) => {
            e.stopPropagation();
            const stage = e.target.getAttribute('data-stage');
            openStageModal(stage);
        });
    });

    const stageModalClose = document.getElementById('stage-modal-close');
    if (stageModalClose) {
        stageModalClose.addEventListener('click', () => {
            document.getElementById('stage-modal').classList.remove('active');
            currentOpenStage = null;
        });
    }

    function openStageModal(stageKey) {
        currentOpenStage = stageKey;
        document.getElementById('stage-modal-image-container').innerHTML = `<img src="${stageImages[stageKey]}" alt="${stageKey}" style="width:100%; height:100%; object-fit:cover;">`;

        // Translation keys mapping
        const stageI18n = {
            'ponton': 'stage_ponton',
            'lake': 'stage_lake',
            'club': 'stage_club',
            'hangar': 'stage_hangar'
        };
        const nameEl = document.getElementById('stage-modal-name');
        nameEl.setAttribute('data-i18n', stageI18n[stageKey]);
        nameEl.textContent = window.i18n ? window.i18n.get(stageI18n[stageKey]) : stageKey;

        const acts = lineupData.filter(act => act.stage === stageKey);
        acts.sort((a, b) => {
            if (a.day !== b.day) return a.day === 'saturday' ? -1 : 1;
            return a.start.localeCompare(b.start);
        });

        const actsHtml = acts.map(act => {
            // Get translation for day based on language
            const dayKey = act.day === 'saturday' ? 'news_day_saturday' : 'news_day_sunday';
            const dayStr = window.i18n ? window.i18n.get(dayKey) : (act.day === 'saturday' ? 'Zaterdag' : 'Zondag');
            return `
                <div style="background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-color);">${act.name}</h3>
                        <span style="font-size: 0.9rem; color: var(--color-accent); font-weight: bold;">${dayStr} ${act.start} - ${act.end}</span>
                    </div>
                </div>
            `;
        }).join('');

        const noActsStr = window.i18n ? window.i18n.get('no_acts_stage') : 'Geen optredens gevonden.';
        document.getElementById('stage-modal-acts').innerHTML = actsHtml || `<p>${noActsStr}</p>`;
        document.getElementById('stage-modal').classList.add('active');
    }
});
