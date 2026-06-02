ufestival

## planning
https://trello.com/b/pEmoq76j/ufestival


## De app…

- …kan worden gebruikt zonder dat een gebruiker zich hoeft aan te melden of in te loggen.
- …kan via een QR code worden geïnstalleerd op het device van de gebruiker.
- …is responsive en werkt goed op mobieltjes met verschillende afmetingen en schermverhoudingen.
- …is tweetalig (Nederlands en Engels), binnen de app kan op ieder moment de taal worden aangepast via een vlaggetje dat altijd in beeld is.
- …heeft een light-, darkmode switch.
- …geeft informatie over het festival.
- …biedt een interactieve kaart van het festivalterrein inclusief eigen locatie (via GPS).
- …biedt een interactief blokschema van het festivalprogramma.
- …kan in de toekomst makkelijk worden aangepast of uitgebreid bij aanpassingen of uitbreidingen m.b.t. de algemene informatie, de line-up, de programmering of het floorplan.
- …biedt de mogelijkheid om te interacteren met locaties van het festivalterrein en andere bezoekers van het festival. (DIT IS EEN EXTRA “NICE TO HAVE FEATURE” WAARVOOR DE INVULLING NOG NIET BEPAALD IS, MOCHT ER TIJD OVER ZIJN DAN KAN HIER AAN WORDEN GEWERKT)

## Techniek

Keuze voor de techniek is vrij. 

Suggesties om te onderzoeken en te bekijken:

https://dev.to/aaronreddix/how-to-build-progressive-web-apps-pwas-using-laravel-1f6o

https://create-react-app.dev/docs/making-a-progressive-web-app/

https://onsen.io/v2/guide/pwa/intro.html

https://alexop.dev/posts/create-pwa-vue3-vite-4-steps/

https://animejs.com/

kleuren
- **Accent**: Vermilion - #F03228 - voor knoppen en interactieve onderdelen
- **Base**: White- #FFFFFF - voor leesteksten of achtergrond (op basis van light- of darkmode)
- **Primary** : Black - #000000 - voor leesteksten of achtergrond (op basis van light- of darkmode)
- **Secondary** : Cerulean - #247BA0 - voor kopteksten
- **Info** : Saffron - #E3B505 - voor informatie of waarschuwingen

### Logo

png

![logoBlack.png](attachment:e7d417b7-35f5-4fb4-8eaf-c1d5118b564f:logoBlack.png)

![logoWhite.png](attachment:f5cf500a-7b47-4b96-bbeb-5bff163355e2:logoWhite.png)

svg

![logo_white.svg](attachment:cd95cf4e-1b26-46a7-a350-df32ba04cefe:logo_white.svg)

![logo_black.svg](attachment:de7fa0d0-39d6-4e5a-9c14-14b167c74ebe:logo_black.svg)

### Typografie

Voor het festival wordt 1 lettertype gebruikt:

https://fonts.google.com/specimen/Sansation

Voor kopteksten wordt gebruik gemaakt van Bold 700
Voor leesteksten wordt gebruik gemaakt van Regular 400
Voor knoppen en andere teksten wordt gebruik gemaakt van Light 300 Italic

Alle teksten moeten goed leesbaar zijn op een mobile device.



AI prompts


https://dev.to/aaronreddix/how-to-build-progressive-web-apps-pwas-using-laravel-1f6o

https://create-react-app.dev/docs/making-a-progressive-web-app/

https://onsen.io/v2/guide/pwa/intro.html

https://alexop.dev/posts/create-pwa-vue3-vite-4-steps/

https://animejs.com/ 

welke van de vijf is het beste om te gebruiken voor een festival app

https://create-react-app.dev/docs/making-a-progressive-web-app/

https://onsen.io/v2/guide/pwa/intro.html

https://alexop.dev/posts/create-pwa-vue3-vite-4-steps/

https://animejs.com/ 




beste manier om een cms te kunnen maken met alleen javascript html css en json

exporteerbaar json en instructie



map js old version:

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
    let mapGraphic = mapImg;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Minimum scale to fit image width
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    const stageMarkers = [
        { stage: 'ponton', cx: 496.9, cy: 849.15 },
        { stage: 'lake', cx: 1256.98, cy: 615.25 },
        { stage: 'club', cx: 2102.13, cy: 231.18 },
        { stage: 'hangar', cx: 1614.31, cy: 528.68 }
    ];

    function updateTransform() {
        const graphic = mapGraphic || mapImg;
        if (!graphic) return;

        const rect = mapViewport.getBoundingClientRect();
        const imgWidth = graphic.clientWidth * scale;
        const imgHeight = graphic.clientHeight * scale;

        const minX = Math.min(0, rect.width - imgWidth);
        const minY = Math.min(0, rect.height - imgHeight);

        translateX = Math.max(minX, Math.min(0, translateX));
        translateY = Math.max(minY, Math.min(0, translateY));

        transformContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function getStageKeyForCircle(circle) {
        const cx = parseFloat(circle.getAttribute('cx') || '0');
        const cy = parseFloat(circle.getAttribute('cy') || '0');

        let matchedStage = null;
        let minDistance = Infinity;

        stageMarkers.forEach(marker => {
            const distance = Math.hypot(cx - marker.cx, cy - marker.cy);
            if (distance < minDistance) {
                minDistance = distance;
                matchedStage = marker.stage;
            }
        });

        return minDistance < 15 ? matchedStage : null;
    }

    function attachMapMarkers(svg) {
        const circles = svg.querySelectorAll('circle[r]');
        circles.forEach(circle => {
            const r = parseFloat(circle.getAttribute('r') || '0');
            if (isNaN(r) || r < 30) return;

            const stageKey = getStageKeyForCircle(circle);
            if (!stageKey) return;

            // Ensure pointer events work on this circle and its parents
            circle.style.pointerEvents = 'auto';
            circle.dataset.stage = stageKey;
            circle.style.cursor = 'pointer';
            circle.style.transition = 'filter 0.2s';
            
            circle.addEventListener('mouseover', () => {
                circle.style.filter = 'brightness(1.2)';
            });
            
            circle.addEventListener('mouseout', () => {
                circle.style.filter = 'brightness(1)';
            });

            circle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.showStageLineup) {
                    window.showStageLineup(stageKey);
                }
            });
            
            // Also attach to parent group if it exists
            let parent = circle.parentElement;
            if (parent && parent.tagName === 'g') {
                parent.style.pointerEvents = 'auto';
                parent.style.cursor = 'pointer';
                parent.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.showStageLineup) {
                        window.showStageLineup(stageKey);
                    }
                });
            }
        });
    }

    function loadInlineMap() {
        fetch('./assets/markers/kaart_festival_markers.svg')
            .then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDocument = parser.parseFromString(svgText, 'image/svg+xml');
                const svgEl = svgDocument.querySelector('svg');
                if (!svgEl) return;

                svgEl.setAttribute('focusable', 'false');
                svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svgEl.style.width = '100%';
                svgEl.style.height = '100%';
                svgEl.style.display = 'block';

                if (mapImg && mapImg.parentNode) {
                    mapImg.parentNode.removeChild(mapImg);
                }

                transformContainer.insertBefore(svgEl, gpsDot);
                mapGraphic = svgEl;
                attachMapMarkers(svgEl);
                updateTransform();
            })
            .catch(err => {
                console.error('Error loading inline SVG map:', err);
            });
    }

    // --- Button Zoom Controls ---
    zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale + 0.5, MAX_SCALE);
        updateTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale - 0.5, MIN_SCALE);
        if (scale === MIN_SCALE) {
            translateX = 0;
            translateY = 0;
        }
        updateTransform();
    });

    // --- Pointer Events for Dragging ---
    mapViewport.addEventListener('pointerdown', (e) => {
        // Don't start drag when clicking a control button or SVG marker
        if (e.target.closest('button') || e.target.closest('circle[data-stage]')) return;

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

    mapViewport.addEventListener('pointercancel', () => {
        isDragging = false;
    });

    // --- Pinch to Zoom (Touch Events) ---
    let initialPinchDistance = null;
    let initialScale = 1;

    mapViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = scale;
        }
    }, { passive: false });

    mapViewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
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
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            gpsDot.style.display = 'none';
            gpsBtn.style.color = 'var(--color-primary)';
            return;
        }

        gpsBtn.style.color = '#4285F4';

        watchId = navigator.geolocation.watchPosition((position) => {
            gpsDot.style.display = 'block';
            gpsDot.style.left = '50%';
            gpsDot.style.top = '50%';
            console.log(`GPS Location updated: ${position.coords.latitude}, ${position.coords.longitude}`);
        }, (error) => {
            console.error('Error getting location:', error);
            alert('Kan locatie niet ophalen. Controleer of je locatie-toegang hebt gegeven.');
            gpsBtn.style.color = 'var(--color-primary)';
            watchId = null;
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    });

    loadInlineMap();
    window.addEventListener('resize', updateTransform);
});
