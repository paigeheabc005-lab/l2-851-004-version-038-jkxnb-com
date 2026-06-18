(function() {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMenu() {
        var toggle = one('[data-menu-toggle]');
        var nav = one('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = all('[data-filter-panel]');
        if (!panels.length) {
            return;
        }
        panels.forEach(function(panel) {
            var root = panel.parentElement;
            var input = one('[data-filter-input]', panel);
            var year = one('[data-filter-year]', panel);
            var region = one('[data-filter-region]', panel);
            var type = one('[data-filter-type]', panel);
            var cards = all('[data-card]', root);
            var empty = one('[data-empty-state]', root);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input && !input.value) {
                input.value = query;
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var q = normalize(input && input.value);
                var y = normalize(year && year.value);
                var r = normalize(region && region.value);
                var t = normalize(type && type.value);
                var visible = 0;
                cards.forEach(function(card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && cardYear.indexOf(y) === -1) {
                        ok = false;
                    }
                    if (r && cardRegion.indexOf(r) === -1) {
                        ok = false;
                    }
                    if (t && cardType.indexOf(t) === -1) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, year, region, type].forEach(function(control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initMenu();
        initHero();
        initFilters();
    });
})();
