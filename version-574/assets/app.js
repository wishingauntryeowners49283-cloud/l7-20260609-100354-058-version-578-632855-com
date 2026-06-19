(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function move(step) {
      show(current + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var section = list.closest('.filter-section') || document;
    var input = section.querySelector('[data-filter-input]');
    var select = section.querySelector('[data-sort-select]');
    var originalCards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var mode = select ? select.value : 'default';
      var cards = originalCards.slice();

      if (mode === 'year-desc') {
        cards.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'year-asc') {
        cards.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }

      if (mode === 'title-asc') {
        cards.sort(function (a, b) {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }

      var fragment = document.createDocumentFragment();

      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
        card.hidden = keyword ? haystack.indexOf(keyword) === -1 : false;
        fragment.appendChild(card);
      });

      list.appendChild(fragment);
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        input.value = query;
      }

      input.addEventListener('input', applyFilters);
    }

    if (select) {
      select.addEventListener('change', applyFilters);
    }

    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (!video || !stream || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function playVideo() {
      if (!video) {
        return;
      }

      loadStream();

      var playTask = video.play();

      if (playTask && typeof playTask.then === 'function') {
        playTask.then(function () {
          player.classList.add('is-playing');
        }).catch(function () {
          player.classList.remove('is-playing');
        });
      } else {
        player.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
