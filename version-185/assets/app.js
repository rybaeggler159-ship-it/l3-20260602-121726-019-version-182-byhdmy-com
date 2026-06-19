const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero-slider]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      start();
    });
  }

  start();
}

const filterLists = Array.from(document.querySelectorAll('[data-filter-list]'));

filterLists.forEach((list) => {
  const scope = list.closest('.content-section') || document;
  const input = scope.querySelector('[data-filter-input]');
  const yearSelect = scope.querySelector('[data-filter-select="year"]');
  const regionSelect = scope.querySelector('[data-filter-select="region"]');
  const cards = Array.from(list.querySelectorAll('.movie-card'));

  const applyFilter = () => {
    const query = input ? input.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';

    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesYear = !year || card.dataset.year === year;
      const matchesRegion = !region || card.dataset.region === region;
      card.classList.toggle('is-filtered-out', !(matchesQuery && matchesYear && matchesRegion));
    });
  };

  if (input) {
    input.addEventListener('input', applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
  if (regionSelect) {
    regionSelect.addEventListener('change', applyFilter);
  }
});

window.initMoviePlayer = function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playerOverlay');

  if (!video || !streamUrl) {
    return;
  }

  let ready = false;

  const attach = () => {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  const play = () => {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
};
