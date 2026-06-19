(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var navMenu = document.querySelector("[data-nav-menu]");
    if (menuButton && navMenu) {
      menuButton.addEventListener("click", function () {
        navMenu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      restart();
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");

    function matchYear(year, filter) {
      var value = parseInt(year, 10);
      if (!filter) {
        return true;
      }
      if (filter === "old") {
        return Number.isFinite(value) && value < 2000;
      }
      if (filter === "2010") {
        return Number.isFinite(value) && value >= 2010 && value < 2020;
      }
      if (filter === "2000") {
        return Number.isFinite(value) && value >= 2000 && value < 2010;
      }
      return String(year) === filter;
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var ok = (!query || haystack.indexOf(query) !== -1) && matchYear(cardYear, year);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("show", shown === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", filterCards);
    }
  });
})();
