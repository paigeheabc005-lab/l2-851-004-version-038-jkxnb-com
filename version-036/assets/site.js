(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 6000);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-year-filter]');
        var count = scope.querySelector('[data-filter-count]');
        var grid = scope.parentElement.querySelector('.category-movie-grid');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !selectedYear || cardYear === selectedYear;
                var shouldShow = matchedKeyword && matchedYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var searchInput = searchPage.querySelector('[data-search-input]');
        var categorySelect = searchPage.querySelector('[data-search-category]');
        var summary = searchPage.querySelector('[data-search-summary]');
        var results = searchPage.querySelector('[data-search-results]');
        var initialQuery = params.get('q') || '';

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '  <a class="poster" href="' + escapeHtml(movie.url) + '">',
                '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-error\');" />',
                '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
                '  </a>',
                '  <div class="movie-card-body">',
                '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
                '    <p class="movie-desc">' + escapeHtml(movie.one_line || '') + '</p>',
                '    <div class="movie-meta">',
                '      <span>' + escapeHtml(movie.year) + '</span>',
                '      <span>' + escapeHtml(movie.region) + '</span>',
                '      <span>' + escapeHtml(movie.genre) + '</span>',
                '    </div>',
                '    <div class="tag-row">' + tags + '</div>',
                '  </div>',
                '</article>'
            ].join('\n');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[character];
            });
        }

        function runSearch() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var selectedCategory = categorySelect ? categorySelect.value : '';
            var data = window.MOVIE_INDEX || [];

            var matched = data.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category_name,
                    movie.one_line,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedCategory = !selectedCategory || movie.category_name === selectedCategory;
                return matchedQuery && matchedCategory;
            });

            if (summary) {
                if (!query && !selectedCategory) {
                    summary.textContent = '默认展示前 80 部影片，可输入关键词进一步筛选。';
                } else {
                    summary.textContent = '找到 ' + matched.length + ' 部相关影片。';
                }
            }

            if (results) {
                results.innerHTML = matched.slice(0, 120).map(createCard).join('\n');
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', runSearch);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', runSearch);
        }

        window.addEventListener('load', runSearch);
    }
})();
