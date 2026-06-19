(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
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

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initLocalFilters() {
    selectAll('[data-list-filter]').forEach(function (section) {
      var input = section.querySelector('[data-filter-input]');
      var count = section.querySelector('[data-visible-count]');
      var cards = selectAll('[data-movie-card]', section);

      if (!input || !count) {
        return;
      }

      function update() {
        var query = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var shouldShow = !query || text.indexOf(query) !== -1;
          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        count.textContent = visible;
      }

      input.addEventListener('input', update);
      update();
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var count = page.querySelector('[data-search-count]');
    var cards = selectAll('[data-movie-card]', page);
    var buttons = selectAll('[data-category-filter]', page);
    var activeCategory = 'all';
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function update() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var category = card.getAttribute('data-category');
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var shouldShow = matchesQuery && matchesCategory;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-category-filter') || 'all';

        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        update();
      });
    });

    if (input) {
      input.addEventListener('input', update);
    }

    update();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('[data-video]');
      var button = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var source = player.getAttribute('data-source');
      var hls = null;
      var loaded = false;

      if (!video || !button || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('播放已就绪，请再次点击视频开始播放');
          });
        }
      }

      function loadAndPlay() {
        if (loaded) {
          playVideo();
          return;
        }

        loaded = true;
        button.classList.add('is-hidden');
        setStatus('正在初始化 HLS 播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成');
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载异常，正在尝试直接播放');
              video.src = source;
              playVideo();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源加载完成');
            playVideo();
          }, { once: true });
        } else {
          video.src = source;
          setStatus('已绑定 m3u8 播放源，请使用支持 HLS 的浏览器播放');
          playVideo();
        }
      }

      button.addEventListener('click', loadAndPlay);
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          loadAndPlay();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
})();
