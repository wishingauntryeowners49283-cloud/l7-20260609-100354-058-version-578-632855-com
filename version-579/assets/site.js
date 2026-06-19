(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || 'search.html';

        if (value) {
          window.location.href = target + '?q=' + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupPageFilter() {
    var input = qs('[data-page-filter]');
    var cards = qsa('[data-card]');
    var chips = qsa('[data-filter-chip]');

    if (!input || !cards.length) {
      return;
    }

    function applyFilter(value) {
      var query = (value || '').trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        card.style.display = haystack.indexOf(query) > -1 ? '' : 'none';
      });
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        input.value = chip.getAttribute('data-filter-chip') || '';
        applyFilter(input.value);
      });
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearchPage() {
    var root = qs('[data-search-results]');

    if (!root || !window.MovieSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var title = qs('[data-search-title]');

    if (title && query) {
      title.textContent = '搜索：' + params.get('q');
    }

    var matches = window.MovieSearchIndex.filter(function (movie) {
      if (!query) {
        return true;
      }

      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine
      ].join(' ').toLowerCase().indexOf(query) > -1;
    }).slice(0, 120);

    if (!matches.length) {
      root.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      return;
    }

    root.innerHTML = matches.map(function (movie) {
      return [
        '<article class="movie-card" data-card>',
        '  <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="score-badge">' + movie.rating + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initPlayer(streamUrl) {
    var video = qs('[data-video-player]');
    var button = qs('[data-play-trigger]');
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function playVideo() {
      attachStream();

      if (button) {
        button.classList.add('is-hidden');
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initHero: initHero,
    initSearchPage: initSearchPage,
    initPlayer: initPlayer
  };

  setupMenu();
  setupSearchForms();
  setupPageFilter();
})();
