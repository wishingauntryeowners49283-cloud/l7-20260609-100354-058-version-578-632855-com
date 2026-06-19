(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobileNav && header) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            header.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-hidden');
        });
    });

    document.querySelectorAll('.global-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (query) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;
    var heroTimer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        heroTimer = window.setInterval(function () {
            setHero(heroIndex + 1);
        }, 5600);
    }

    function stopHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
            heroTimer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var target = Number(dot.getAttribute('data-hero-dot') || 0);
            setHero(target);
            startHero();
        });
    });

    startHero();

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchInput = document.getElementById('movie-search');
    var yearSelect = document.getElementById('filter-year');
    var typeSelect = document.getElementById('filter-type');
    var sortSelect = document.getElementById('sort-select');
    var grid = document.querySelector('.searchable-grid');
    var empty = document.querySelector('[data-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' '));
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value.trim() : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var matchQuery = !query || cardText(card).indexOf(query) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var matchType = !type || card.getAttribute('data-type') === type;
            var show = matchQuery && matchYear && matchType;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    function applySort() {
        if (!sortSelect || !grid) {
            return;
        }
        var mode = sortSelect.value;
        var sorted = cards.slice();
        if (mode === 'year-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            });
        }
        if (mode === 'year-asc') {
            sorted.sort(function (a, b) {
                return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
            });
        }
        if (mode === 'title-asc') {
            sorted.sort(function (a, b) {
                return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
            });
        }
        sorted.forEach(function (card) {
            grid.appendChild(card);
        });
        applyFilters();
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    applyFilters();
})();
