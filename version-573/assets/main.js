(function () {
  var header = document.querySelector('.site-header');
  var mobileButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  function setHeaderState() {
    if (!header || header.classList.contains('site-header-solid')) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobilePanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function resetTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        resetTimer();
      });
    });

    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
    var input = filterPanel.querySelector('[data-filter-search]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (year && params.get('year')) {
      year.value = params.get('year');
    }

    function includesValue(source, value) {
      return !value || String(source || '').toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';

      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.keywords].join(' ').toLowerCase();
        var matched = includesValue(haystack, query) && includesValue(card.dataset.type, typeValue) && includesValue(card.dataset.year, yearValue) && includesValue(card.dataset.region, regionValue);
        card.classList.toggle('is-filter-hidden', !matched);
      });
    }

    [input, type, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
