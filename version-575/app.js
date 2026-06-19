(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function textOf(item) {
    return [
      item.getAttribute('data-title'),
      item.getAttribute('data-year'),
      item.getAttribute('data-region'),
      item.getAttribute('data-genre'),
      item.getAttribute('data-category'),
      item.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter(root, keyword, year, region) {
    var items = qsa('.search-item', root);
    var shown = 0;
    var q = (keyword || '').trim().toLowerCase();
    items.forEach(function (item) {
      var matchKeyword = !q || textOf(item).indexOf(q) !== -1;
      var matchYear = !year || (item.getAttribute('data-year') || '').indexOf(year) !== -1;
      var matchRegion = !region || (item.getAttribute('data-region') || '').indexOf(region) !== -1;
      var visible = matchKeyword && matchYear && matchRegion;
      item.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    var empty = qs('[data-empty-state]', document);
    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  function initFilters() {
    var bar = qs('[data-filter-bar]');
    var list = qs('[data-filter-list]');
    if (!bar || !list) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', bar);
    var year = qs('[data-filter-year]', bar);
    var region = qs('[data-filter-region]', bar);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = qs('[data-search-input]');
    if (searchInput) {
      searchInput.value = query;
    }
    if (keyword && query) {
      keyword.value = query;
    }

    function update() {
      applyFilter(list, keyword ? keyword.value : '', year ? year.value : '', region ? region.value : '');
    }

    [keyword, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });
    update();
  }

  function initPlayer() {
    var frame = qs('.player-frame');
    if (!frame) {
      return;
    }
    var video = qs('video', frame);
    var button = qs('.play-layer', frame);
    var source = frame.getAttribute('data-m3u8');
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !video || !source) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      frame.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    frame.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        frame.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayer();
  });
})();
