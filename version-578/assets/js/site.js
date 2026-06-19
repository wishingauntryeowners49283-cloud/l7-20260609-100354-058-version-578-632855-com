(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    var search = document.querySelector(".nav-search");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function bindImageFallback() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.remove();
      }, { once: true });
    });
  }

  function bindFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-message]");

      if (!list) {
        return;
      }

      var items = Array.prototype.slice.call(list.children);

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var selectedYear = normalize(year ? year.value : "");
        var selectedType = normalize(type ? type.value : "");
        var visibleCount = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-genre")
          ].join(" "));
          var itemYear = normalize(item.getAttribute("data-year"));
          var itemType = normalize(item.getAttribute("data-type"));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || itemYear === selectedYear;
          var matchType = !selectedType || itemType === selectedType;
          var isVisible = matchKeyword && matchYear && matchType;

          item.classList.toggle("is-hidden", !isVisible);
          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function bindPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var source = player.getAttribute("data-hls");
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-hls-ready") === "true") {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        video.setAttribute("data-hls-ready", "true");
      }

      function playVideo() {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          attachSource();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-number">' + escapeHtml(movie.coverNumber) + '</span>',
      '    <span class="rating-badge">' + escapeHtml(movie.rating) + '分</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <a class="card-category" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a>',
      '  </div>',
      '</article>'
    ].join("
");
  }

  function bindSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var form = document.querySelector("[data-search-form]");

    if (!results || !input || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var keyword = normalize(query);
      var matched = window.SITE_MOVIES.filter(function (movie) {
        if (!keyword) {
          return movie.hot === true;
        }
        return normalize(movie.searchText).indexOf(keyword) !== -1;
      }).slice(0, keyword ? 120 : 24);

      if (title) {
        title.textContent = keyword ? "搜索结果" : "热门检索";
      }

      if (!matched.length) {
        results.innerHTML = '<p class="empty-message is-visible">没有匹配的影片，请换一个关键词。</p>';
        return;
      }

      results.innerHTML = matched.map(movieCardTemplate).join("
");
      bindImageFallback();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState({}, "", url);
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindImageFallback();
    bindFilters();
    bindPlayer();
    bindSearchPage();
  });
})();
