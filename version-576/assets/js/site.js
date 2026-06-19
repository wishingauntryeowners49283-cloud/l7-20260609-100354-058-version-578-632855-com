(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = queryAll('.hero-slide', hero);
        var dots = queryAll('.hero-dot', hero);
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function setupFilters() {
        var list = document.querySelector('[data-filter-list]');
        var panel = document.querySelector('[data-filter-panel]');
        if (!list || !panel) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var sortSelect = panel.querySelector('[data-sort-mode]');
        var empty = document.querySelector('[data-filter-empty]');
        var cards = queryAll('.movie-card', list);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }

        function textOf(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matchesKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchesType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
                var matchesYear = !year || (card.getAttribute('data-year') || '') === year;
                var visible = matchesKeyword && matchesType && matchesYear;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        function sortCards() {
            var mode = sortSelect ? sortSelect.value : 'hot';
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === 'year') {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                }
                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                }
                return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (sortSelect) {
            sortSelect.addEventListener('change', sortCards);
        }
        sortCards();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
