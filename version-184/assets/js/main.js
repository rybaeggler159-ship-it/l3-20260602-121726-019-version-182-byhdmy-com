document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 6200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));

    function buildResult(movie) {
        return '<a class="search-result" href="' + movie.url + '">' +
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
            '<span><strong>' + movie.title + '</strong><small>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</small></span>' +
            '</a>';
    }

    searchInputs.forEach(function (input) {
        var target = document.querySelector(input.getAttribute("data-results"));

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();

            if (!target) {
                return;
            }

            if (!keyword) {
                target.classList.remove("is-open");
                target.innerHTML = "";
                return;
            }

            var source = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
            var matches = source.filter(function (movie) {
                return [movie.title, movie.year, movie.region, movie.type, movie.genre].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 8);

            target.innerHTML = matches.map(buildResult).join("");
            target.classList.toggle("is-open", matches.length > 0);
        });
    });

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
        var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
        var yearSelect = filterRoot.querySelector("[data-filter-year]");
        var typeSelect = filterRoot.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
        var emptyState = filterRoot.querySelector("[data-empty-state]");

        function applyFilters() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.region].join(" ").toLowerCase();
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (year && card.dataset.year !== year) {
                    matched = false;
                }

                if (type && card.dataset.type !== type) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }
});
