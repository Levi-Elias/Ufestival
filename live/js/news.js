/**
 * news.js – Rotating "Today on Stage" news block for the home page.
 * - Loads lineup.json, filters acts by today's festival day (sat/sun).
 * - Falls back to showing all weekend acts when it's not a festival day.
 * - Rotates every 5 seconds with a smooth crossfade + animated progress bar.
 * - Responds to language changes via the 'languageChanged' event.
 */

(function () {
    const INTERVAL_MS = 5000;
    const STAGE_NAMES = {
        ponton: 'Ponton',
        lake: 'The Lake',
        club: 'The Club',
        hangar: 'Hangar'
    };

    let acts = [];
    let currentIndex = 0;
    let intervalId = null;
    let progressId = null;

    // Determine which festival day key matches today
    function getTodayKey() {
        const day = new Date().getDay(); // 0=Sun, 6=Sat
        if (day === 6) return 'saturday';
        if (day === 0) return 'sunday';
        return null; // Not a festival day
    }

    function formatTime(start, end) {
        return `${start} – ${end}`;
    }

    function getLang() {
        return (window.i18n && window.i18n.getCurrentLang()) || 'nl';
    }

    function t(key) {
        return (window.i18n && window.i18n.get(key)) || key;
    }

    function buildSlideHTML(act) {
        const lang = getLang();
        const stageName = STAGE_NAMES[act.stage] || act.stage;
        const hasImage = act.image && act.image !== '';

        const dayKey = act.day === 'saturday' ? 'news_day_saturday' : 'news_day_sunday';
        const dayLabel = t(dayKey);

        return `
            <div class="news-act-inner">
                ${hasImage ? `<div class="news-act-img" style="background-image: url('${act.image}')"></div>` : `<div class="news-act-img news-act-img--placeholder"></div>`}
                <div class="news-act-info">
                    <div class="news-act-day">📅 ${dayLabel}</div>
                    <div class="news-act-name">${act.name}</div>
                    <div class="news-act-meta">
                        <span class="news-act-stage">📍 ${stageName}</span>
                        <span class="news-act-time">🕐 ${formatTime(act.start, act.end)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function updateDots() {
        const container = document.getElementById('news-dots');
        if (!container) return;
        container.innerHTML = '';
        acts.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'news-dot' + (i === currentIndex ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            container.appendChild(dot);
        });
    }

    function updateTitle() {
        const todayKey = getTodayKey();
        const titleEl = document.querySelector('[data-i18n="news_today"]');
        if (!titleEl) return;
        if (todayKey) {
            titleEl.textContent = t('news_today');
        } else {
            titleEl.textContent = t('news_all_acts');
        }
    }

    function showSlide(index, direction) {
        const slide = document.getElementById('news-slide-content');
        if (!slide || acts.length === 0) return;

        slide.classList.remove('fade-in');
        // Force reflow to restart animation
        void slide.offsetWidth;
        slide.innerHTML = buildSlideHTML(acts[index]);
        slide.classList.add('fade-in');

        updateDots();
        restartProgress();
    }

    function goTo(index) {
        currentIndex = ((index % acts.length) + acts.length) % acts.length;
        showSlide(currentIndex);
    }

    function next() {
        currentIndex = (currentIndex + 1) % acts.length;
        showSlide(currentIndex);
    }

    function startRotation() {
        stopRotation();
        if (acts.length <= 1) return;
        intervalId = setInterval(next, INTERVAL_MS);
    }

    function stopRotation() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        if (progressId) { clearTimeout(progressId); progressId = null; }
    }

    function restartProgress() {
        const fill = document.getElementById('news-progress-fill');
        if (!fill) return;
        fill.style.transition = 'none';
        fill.style.width = '0%';
        void fill.offsetWidth;
        fill.style.transition = `width ${INTERVAL_MS}ms linear`;
        fill.style.width = '100%';
    }

    function renderEmpty() {
        const slide = document.getElementById('news-slide-content');
        if (slide) {
            slide.innerHTML = `<div class="news-empty">${t('news_no_acts')}</div>`;
        }
        const dots = document.getElementById('news-dots');
        if (dots) dots.innerHTML = '';
    }

    function init(lineup) {
        const todayKey = getTodayKey();

        if (todayKey) {
            acts = lineup.filter(a => a.day === todayKey);
        } else {
            // Not a festival day – show all acts across both days
            acts = lineup;
        }

        // Sort by start time
        acts.sort((a, b) => a.start.localeCompare(b.start));

        updateTitle();

        if (acts.length === 0) {
            renderEmpty();
            return;
        }

        currentIndex = 0;
        showSlide(currentIndex);
        startRotation();
    }

    function refresh() {
        // Re-render current slide with updated language
        updateTitle();
        if (acts.length > 0) {
            showSlide(currentIndex);
        } else {
            renderEmpty();
        }
    }

    // Load lineup data
    document.addEventListener('DOMContentLoaded', () => {
        fetch('./data/lineup.json')
            .then(r => r.json())
            .then(data => init(data))
            .catch(err => console.warn('news.js: Could not load lineup.json', err));

        // React to language changes
        document.addEventListener('languageChanged', () => refresh());

        // Pause rotation when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopRotation();
            } else {
                startRotation();
                restartProgress();
            }
        });
    });
})();
