(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var button = $('.mobile-toggle');
    var nav = $('.nav');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');

    if (!slides.length || !dots.length) {
      return;
    }

    var index = 0;

    function show(nextIndex) {
      index = nextIndex % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearch() {
    var input = $('[data-search-input]');
    var select = $('[data-search-select]');
    var grid = $('[data-card-grid]');
    var empty = $('[data-empty-state]');

    if (!input || !grid) {
      return;
    }

    var cards = $all('[data-card]', grid);

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var keyword = normalize(input.value);
      var category = select ? normalize(select.value) : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatch = !category || cardCategory === category;
        var shouldShow = keywordMatch && categoryMatch;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    input.addEventListener('input', filterCards);

    if (select) {
      select.addEventListener('change', filterCards);
    }
  }

  function setupBrokenImageFallback() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  function setupPlayer() {
    var shell = $('.player-shell');

    if (!shell) {
      return;
    }

    var video = $('video', shell);
    var button = $('.play-button', shell);
    var overlay = $('.play-overlay', shell);

    if (!video || !button) {
      return;
    }

    var src = video.getAttribute('data-video-src');
    var initialized = false;

    function startPlayback() {
      if (!src) {
        return;
      }

      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }

        initialized = true;
      }

      if (overlay) {
        overlay.style.display = 'none';
      }

      video.controls = true;
      video.play().catch(function () {
        video.controls = true;
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', startPlayback, { once: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupSearch();
    setupBrokenImageFallback();
    setupPlayer();
  });
})();
