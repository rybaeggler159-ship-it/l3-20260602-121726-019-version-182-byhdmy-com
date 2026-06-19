(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.main-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            navigation.classList.toggle('open');
        });
    }

    const carousel = document.getElementById('heroCarousel');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let current = 0;

        const showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5600);
        }
    }

    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults && Array.isArray(window.siteSearchData)) {
        const renderResults = function (items) {
            searchResults.innerHTML = items.slice(0, 24).map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '">' +
                    '<strong>' + item.title + '</strong>' +
                    '<span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>' +
                    '</a>';
            }).join('');
            searchResults.classList.toggle('active', items.length > 0);
        };

        searchInput.addEventListener('input', function () {
            const keyword = searchInput.value.trim().toLowerCase();

            if (!keyword) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                return;
            }

            const matches = window.siteSearchData.filter(function (item) {
                return item.search.includes(keyword);
            });

            renderResults(matches);
        });
    }
})();
