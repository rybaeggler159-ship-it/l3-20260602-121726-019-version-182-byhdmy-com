const SELECTORS = {
    menuToggle: '[data-menu-toggle]',
    mobileNav: '[data-mobile-nav]',
    heroSlide: '[data-hero-slide]',
    heroDot: '[data-hero-dot]',
    movieList: '[data-movie-list]',
    movieCard: '.movie-card',
    emptyState: '[data-empty-state]',
    resultCount: '[data-result-count]',
    player: '#movie-player',
    playButton: '[data-play-video]',
    playerStatus: '[data-player-status]'
};

function fallbackSvg(title) {
    const safeTitle = String(title || '影片').slice(0, 16);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#fef3c7"/>
                    <stop offset="0.56" stop-color="#f59e0b"/>
                    <stop offset="1" stop-color="#be123c"/>
                </linearGradient>
                <radialGradient id="r" cx="0.25" cy="0.2" r="0.8">
                    <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
                    <stop offset="1" stop-color="#111827" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <rect width="900" height="560" rx="36" fill="url(#g)"/>
            <rect width="900" height="560" rx="36" fill="url(#r)"/>
            <circle cx="720" cy="110" r="96" fill="#ffffff" opacity="0.18"/>
            <circle cx="130" cy="430" r="150" fill="#111827" opacity="0.15"/>
            <text x="50%" y="48%" text-anchor="middle" fill="#ffffff" font-size="56" font-weight="800" font-family="Arial, sans-serif">${safeTitle}</text>
            <text x="50%" y="60%" text-anchor="middle" fill="#fff7ed" font-size="24" font-family="Arial, sans-serif">高清影片 · 在线播放</text>
        </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback-title]').forEach((image) => {
        image.addEventListener('error', () => {
            if (image.dataset.fallbackApplied === '1') {
                return;
            }
            image.dataset.fallbackApplied = '1';
            image.src = fallbackSvg(image.dataset.fallbackTitle);
        });
    });
}

function initMenu() {
    const button = document.querySelector(SELECTORS.menuToggle);
    const nav = document.querySelector(SELECTORS.mobileNav);

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

function initHero() {
    const slides = Array.from(document.querySelectorAll(SELECTORS.heroSlide));
    const dots = Array.from(document.querySelectorAll(SELECTORS.heroDot));

    if (slides.length <= 1) {
        return;
    }

    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === current);
        });
    };

    const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    start();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initFilters() {
    const panel = document.querySelector('.filter-panel');
    const list = document.querySelector(SELECTORS.movieList);

    if (!panel || !list) {
        return;
    }

    const searchInput = document.getElementById('movie-search');
    const yearSelect = document.getElementById('filter-year');
    const typeSelect = document.getElementById('filter-type');
    const regionSelect = document.getElementById('filter-region');
    const sortSelect = document.getElementById('sort-select');
    const resultCount = document.querySelector(SELECTORS.resultCount);
    const emptyState = document.querySelector(SELECTORS.emptyState);

    const allCards = Array.from(list.querySelectorAll(SELECTORS.movieCard));

    const readCardText = (card) => normalize(card.textContent);

    const apply = () => {
        const query = normalize(searchInput?.value);
        const year = normalize(yearSelect?.value);
        const type = normalize(typeSelect?.value);
        const region = normalize(regionSelect?.value);
        const sort = sortSelect?.value || 'year-desc';

        const cards = [...allCards];
        cards.sort((left, right) => {
            if (sort === 'year-asc') {
                return Number(left.dataset.year || 0) - Number(right.dataset.year || 0);
            }
            if (sort === 'weight-desc') {
                return Number(right.dataset.weight || 0) - Number(left.dataset.weight || 0);
            }
            if (sort === 'title-asc') {
                return String(left.dataset.title || '').localeCompare(String(right.dataset.title || ''), 'zh-Hans-CN');
            }
            return Number(right.dataset.year || 0) - Number(left.dataset.year || 0);
        });

        cards.forEach((card) => list.appendChild(card));

        let visibleCount = 0;
        cards.forEach((card) => {
            const matchesQuery = !query || readCardText(card).includes(query);
            const matchesYear = !year || normalize(card.dataset.year) === year;
            const matchesType = !type || normalize(card.dataset.type) === type;
            const matchesRegion = !region || normalize(card.dataset.region) === region;
            const visible = matchesQuery && matchesYear && matchesType && matchesRegion;

            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = String(visibleCount);
        }

        if (emptyState) {
            emptyState.classList.toggle('show', visibleCount === 0);
        }
    };

    [searchInput, yearSelect, typeSelect, regionSelect, sortSelect].forEach((control) => {
        if (!control) {
            return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
    });

    apply();
}

async function getHlsClass() {
    if (window.Hls) {
        return window.Hls;
    }

    try {
        const module = await import('./hls-vendor.js');
        return module.H || module.default || null;
    } catch (error) {
        console.warn('HLS module load failed, falling back to native playback.', error);
        return null;
    }
}

function updatePlayerStatus(message) {
    const status = document.querySelector(SELECTORS.playerStatus);
    if (status) {
        status.textContent = message;
    }
}

function initPlayer() {
    const video = document.querySelector(SELECTORS.player);
    const playButton = document.querySelector(SELECTORS.playButton);

    if (!video) {
        return;
    }

    const source = video.dataset.videoSrc;
    let loading = false;
    let ready = false;

    const load = async (autoplay = true) => {
        if (!source || loading) {
            return;
        }

        if (ready) {
            if (autoplay) {
                video.play().catch(() => null);
            }
            return;
        }

        loading = true;
        updatePlayerStatus('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            loading = false;
            updatePlayerStatus('播放源已加载。');
            if (autoplay) {
                video.play().catch(() => null);
            }
            return;
        }

        const Hls = await getHlsClass();
        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                ready = true;
                loading = false;
                updatePlayerStatus('播放源已加载。');
                if (autoplay) {
                    video.play().catch(() => null);
                }
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    updatePlayerStatus('播放暂时不可用，请刷新页面或稍后重试。');
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            });
        } else {
            video.src = source;
            ready = true;
            loading = false;
            updatePlayerStatus('已使用浏览器原生方式加载播放源。');
            if (autoplay) {
                video.play().catch(() => null);
            }
        }
    };

    if (playButton) {
        playButton.addEventListener('click', () => {
            playButton.classList.add('hidden');
            load(true);
        });
    }

    video.addEventListener('play', () => {
        if (playButton) {
            playButton.classList.add('hidden');
        }
        load(false);
    }, { once: true });
}

initImageFallbacks();
initMenu();
initHero();
initFilters();
initPlayer();
