import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initMobileNav() {
    const button = $('[data-mobile-menu-button]');
    const menu = $('[data-mobile-menu]');
    if (!button || !menu) return;

    button.addEventListener('click', () => {
        menu.classList.toggle('open');
        button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
}

function initImageFallbacks() {
    $$('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.classList.add('is-missing-image');
        }, { once: true });
    });
}

function initFilters() {
    const root = $('[data-filter-root]');
    if (!root) return;

    const search = $('[data-filter-search]', root);
    const category = $('[data-filter-category]', root);
    const region = $('[data-filter-region]', root);
    const type = $('[data-filter-type]', root);
    const year = $('[data-filter-year]', root);
    const reset = $('[data-filter-reset]', root);
    const count = $('[data-filter-count]', root);
    const emptyState = $('[data-empty-state]');
    const cards = $$('[data-movie-card]');

    const apply = () => {
        const searchValue = normalize(search?.value);
        const categoryValue = normalize(category?.value);
        const regionValue = normalize(region?.value);
        const typeValue = normalize(type?.value);
        const yearValue = normalize(year?.value);
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.textContent,
            ].join(' '));
            const matchesSearch = !searchValue || haystack.includes(searchValue);
            const matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
            const matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
            const matchesType = !typeValue || normalize(card.dataset.type).includes(typeValue);
            const matchesYear = !yearValue || normalize(card.dataset.year).includes(yearValue);
            const matches = matchesSearch && matchesCategory && matchesRegion && matchesType && matchesYear;

            card.classList.toggle('is-hidden', !matches);
            if (matches) visible += 1;
        });

        if (count) count.textContent = String(visible);
        if (emptyState) emptyState.classList.toggle('show', visible === 0);
    };

    [search, category, region, type, year].forEach((control) => {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
    });

    if (reset) {
        reset.addEventListener('click', () => {
            [search, category, region, type, year].forEach((control) => {
                if (control) control.value = '';
            });
            apply();
        });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('q') && search) {
        search.value = params.get('q') || '';
    }
    apply();
}

function setPlayerError(wrapper, message) {
    const error = $('[data-player-error]', wrapper);
    const loading = $('[data-player-loading]', wrapper);
    if (loading) loading.classList.add('hidden');
    if (error) {
        error.hidden = false;
        error.textContent = message;
    }
}

function initHlsPlayer(wrapper) {
    const video = $('video[data-src]', wrapper);
    if (!video) return;

    const source = video.dataset.src;
    const loading = $('[data-player-loading]', wrapper);
    const playButtons = $$('[data-play-button]', wrapper);
    const muteButton = $('[data-mute-button]', wrapper);
    const fullscreenButton = $('[data-fullscreen-button]', wrapper);
    const bigPlay = $('.video-big-play', wrapper);
    let attached = false;
    let hls = null;

    const setLoading = (isLoading) => {
        if (loading) loading.classList.toggle('hidden', !isLoading);
    };

    const updatePlayState = () => {
        const isPlaying = !video.paused && !video.ended;
        playButtons.forEach((button) => {
            button.textContent = isPlaying ? '⏸' : '▶';
        });
        if (bigPlay) bigPlay.classList.toggle('playing', isPlaying);
    };

    const attach = () => {
        if (attached) return true;
        if (!source) {
            setPlayerError(wrapper, '未找到可用播放源。');
            return false;
        }
        setLoading(true);
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    setPlayerError(wrapper, '视频加载失败，请稍后重试。');
                    if (hls) hls.destroy();
                }
            });
            attached = true;
            return true;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', () => setLoading(false), { once: true });
            attached = true;
            return true;
        }
        setPlayerError(wrapper, '当前浏览器不支持 HLS 播放。');
        return false;
    };

    const togglePlay = async () => {
        if (!attach()) return;
        try {
            if (video.paused || video.ended) {
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            setPlayerError(wrapper, '浏览器阻止了自动播放，请再次点击播放按钮。');
        }
        updatePlayState();
    };

    playButtons.forEach((button) => button.addEventListener('click', togglePlay));
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('ended', updatePlayState);

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen();
            }
        });
    }

    attach();

    window.addEventListener('pagehide', () => {
        if (hls) hls.destroy();
    });
}

function initPlayers() {
    $$('[data-hls-player]').forEach(initHlsPlayer);
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initImageFallbacks();
    initFilters();
    initPlayers();
});
