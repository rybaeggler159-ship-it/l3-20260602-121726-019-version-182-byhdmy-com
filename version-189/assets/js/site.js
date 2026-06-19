(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prevButton = document.querySelector('.hero-prev');
  var nextButton = document.querySelector('.hero-next');
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, idx) {
      slide.classList.toggle('is-active', idx === activeSlide);
    });

    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === activeSlide);
    });
  }

  function nextSlide() {
    showSlide(activeSlide + 1);
  }

  function restartTimer() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(nextSlide, 5000);
    }
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(activeSlide - 1);
      restartTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      nextSlide();
      restartTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      restartTimer();
    });
  });

  restartTimer();

  var keywordInput = document.getElementById('search-keyword');
  var categorySelect = document.getElementById('search-category');
  var yearInput = document.getElementById('search-year');
  var localGrid = document.querySelector('[data-local-filter="true"]');
  var resultList = document.getElementById('search-results');
  var resultCount = document.getElementById('search-count');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function localFilter() {
    if (!localGrid) {
      return;
    }

    var keyword = normalize(keywordInput && keywordInput.value);
    var year = normalize(yearInput && yearInput.value);
    var cards = Array.prototype.slice.call(localGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var visible = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear.indexOf(year) !== -1);
      card.style.display = visible ? '' : 'none';
    });
  }

  function renderGlobalResults() {
    if (!resultList || !window.MOVIE_INDEX) {
      localFilter();
      return;
    }

    var keyword = normalize(keywordInput && keywordInput.value);
    var category = normalize(categorySelect && categorySelect.value);
    var year = normalize(yearInput && yearInput.value);

    if (!keyword && !category && !year) {
      resultList.innerHTML = '';
      if (resultCount) {
        resultCount.textContent = '输入关键词后显示匹配结果';
      }
      return;
    }

    var matches = window.MOVIE_INDEX.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.category
      ].join(' '));
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var categoryMatch = !category || normalize(movie.category) === category;
      var yearMatch = !year || normalize(movie.year).indexOf(year) !== -1;
      return keywordMatch && categoryMatch && yearMatch;
    }).slice(0, 80);

    if (resultCount) {
      resultCount.textContent = '找到 ' + matches.length + ' 条匹配结果';
    }

    resultList.innerHTML = matches.map(function (movie) {
      return '<a class="search-result-item" href="' + movie.url + '">' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.category) + '</span>' +
        '<span>' + escapeHtml(movie.genre) + '</span>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  [keywordInput, categorySelect, yearInput].forEach(function (control) {
    if (control) {
      control.addEventListener('input', renderGlobalResults);
      control.addEventListener('change', renderGlobalResults);
    }
  });

  try {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && keywordInput) {
      keywordInput.value = query;
      renderGlobalResults();
    }
  } catch (error) {
    renderGlobalResults();
  }
}());
