(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
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

  function initCardFilter() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-card-search]', panel);
      var list = qs('[data-card-list]') || panel.parentNode.querySelector('[data-card-list]');
      var chips = qsa('[data-filter-chip]', panel);
      var activeChip = '';
      if (!list) {
        return;
      }
      var cards = qsa('[data-title]', list);

      function apply() {
        var query = normalize(input ? input.value : '');
        var chip = normalize(activeChip);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' '));
          var visible = (!query || haystack.indexOf(query) !== -1) && (!chip || haystack.indexOf(chip) !== -1);
          card.classList.toggle('is-hidden', !visible);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chipButton) {
        chipButton.addEventListener('click', function () {
          activeChip = chipButton.getAttribute('data-filter-chip') || '';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chipButton);
          });
          apply();
        });
      });
    });
  }

  function resultCard(item) {
    return [
      '<article class="movie-card search-result-card">',
      '<a class="poster-link" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var form = qs('[data-site-search]');
    var results = qs('[data-search-results]');
    if (!form || !results || !window.SEARCH_INDEX) {
      return;
    }
    var input = qs('input[name="q"]', form);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = normalize(input.value);
      var pool = window.SEARCH_INDEX;
      var found = pool.filter(function (item) {
        return !query || normalize(item.text).indexOf(query) !== -1;
      }).slice(0, 96);
      if (!found.length) {
        results.innerHTML = '<div class="empty-state"><h2>暂无匹配影片</h2><p>可以尝试更换片名、年份、地区或标签。</p></div>';
        return;
      }
      results.innerHTML = found.map(resultCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    qsa('[data-search-suggest]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-search-suggest') || '';
        render();
      });
    });
    render();
  }

  function mountPlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var hls = null;
    var ready = false;

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.MoviePage = {
    mountPlayer: mountPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
  });
})();
