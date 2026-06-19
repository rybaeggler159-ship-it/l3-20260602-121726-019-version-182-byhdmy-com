(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initNavigation() {
        var toggle = one(".nav-toggle");
        var menu = one(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
        all(".mobile-link", menu).forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function initHero() {
        var slider = one("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = all(".hero-slide", slider);
        var dots = all(".hero-dot", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        all("[data-filter-root]").forEach(function (root) {
            var input = one("[data-filter-search]", root);
            var type = one("[data-filter-type]", root);
            var year = one("[data-filter-year]", root);
            var cards = all(".movie-card", root);
            var empty = one(".empty-state", root);
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = (!query || text.indexOf(query) !== -1) && (!typeValue || cardType === typeValue) && (!yearValue || cardYear === yearValue);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function initHeroSearch() {
        var form = one("[data-hero-search-form]");
        if (!form) {
            return;
        }
        var heroInput = one("[data-hero-search]", form);
        var section = one("#home-list");
        var filterInput = section ? one("[data-filter-search]", section) : null;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (filterInput && heroInput) {
                filterInput.value = heroInput.value;
                filterInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    function bindStream(video, streamUrl) {
        if (video.getAttribute("data-loaded") === "true") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsHandler = hls;
        } else {
            video.src = streamUrl;
        }
        video.setAttribute("data-loaded", "true");
    }

    function initPlayer(streamUrl, videoId, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        function start() {
            bindStream(video, streamUrl);
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.getAttribute("data-loaded") !== "true") {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    }

    window.SiteMovie = {
        initPlayer: initPlayer
    };

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initFilters();
        initHeroSearch();
    });
})();
