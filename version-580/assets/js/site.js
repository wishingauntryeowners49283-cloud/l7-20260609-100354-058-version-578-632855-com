(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayer();
        applyQuerySearch();
    });

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var list = document.querySelector('[data-card-list]');
        var searchInput = document.querySelector('[data-search-input]');
        if (!list || !searchInput) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var yearSelect = document.querySelector('[data-filter-year]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var categorySelect = document.querySelector('[data-filter-category]');
        var reset = document.querySelector('[data-filter-reset]');
        var count = document.querySelector('[data-result-count]');

        fillSelect(yearSelect, unique(cards, 'year').sort(function (a, b) { return String(b).localeCompare(String(a)); }));
        fillSelect(regionSelect, unique(cards, 'region').sort());
        fillSelect(typeSelect, unique(cards, 'type').sort());

        function apply() {
            var keyword = normalize(searchInput.value);
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchesKeyword = !keyword || normalize(card.dataset.search || '').indexOf(keyword) !== -1;
                var matchesYear = !year || card.dataset.year === year;
                var matchesRegion = !region || card.dataset.region === region;
                var matchesType = !type || card.dataset.type === type;
                var matchesCategory = !category || card.dataset.category === category;
                var shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType && matchesCategory;
                card.classList.toggle('hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        searchInput.addEventListener('input', apply);
        [yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (select) {
            if (select) {
                select.addEventListener('change', apply);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                searchInput.value = '';
                [yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (select) {
                    if (select) {
                        select.value = '';
                    }
                });
                apply();
            });
        }
        apply();
    }

    function unique(cards, field) {
        var seen = Object.create(null);
        cards.forEach(function (card) {
            var value = card.dataset[field] || '';
            if (value) {
                seen[value] = true;
            }
        });
        return Object.keys(seen);
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var input = document.querySelector('[data-search-input]');
        if (query && input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupPlayer() {
        var panel = document.querySelector('.player-panel');
        if (!panel) {
            return;
        }
        var video = panel.querySelector('.movie-player');
        var trigger = panel.querySelector('[data-video-trigger]');
        var status = panel.querySelector('[data-player-status]');
        if (!video || !trigger) {
            return;
        }

        trigger.addEventListener('click', function () {
            var source = video.dataset.videoSrc;
            if (!source) {
                setStatus(status, '未找到播放源。');
                return;
            }
            trigger.classList.add('hidden');
            initializeHlsVideo(video, source, status);
        });
    }

    function initializeHlsVideo(video, source, status) {
        if (video.dataset.initialized === 'true') {
            video.play().catch(function () {});
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.initialized = 'true';
            setStatus(status, '正在使用浏览器原生 HLS 播放。');
            video.play().catch(function () {
                setStatus(status, '播放已准备，请再次点击视频播放按钮。');
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.dataset.initialized = 'true';
                setStatus(status, 'HLS 播放源加载完成，正在播放。');
                video.play().catch(function () {
                    setStatus(status, '播放源已加载，请再次点击视频播放按钮。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus(status, '播放源加载失败，请稍后重试或检查网络。');
                    hls.destroy();
                }
            });
            return;
        }

        video.src = source;
        setStatus(status, '当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
        video.play().catch(function () {});
    }

    function setStatus(status, message) {
        if (status) {
            status.textContent = message;
        }
    }
})();
