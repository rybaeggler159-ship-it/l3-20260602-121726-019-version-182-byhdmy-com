(function () {
    const video = document.getElementById('moviePlayer');
    const overlay = document.getElementById('playerOverlay');
    let loaded = false;

    const start = function () {
        if (!video || !playerMediaUrl) {
            return;
        }

        if (!loaded) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playerMediaUrl;
            } else if (window.Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playerMediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = playerMediaUrl;
            }
            loaded = true;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }
})();
