(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMobileNav() {
    var toggle = qs('.nav-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setCarousel() {
    var root = qs('[data-carousel]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.hero-dot', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      root.style.setProperty('--hero-img', slides[index].style.getPropertyValue('--hero-img'));
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setPageFilter() {
    var input = qs('#page-filter');
    var cards = qsa('.movie-card');
    var count = qs('.filter-count');
    if (!input || !cards.length) {
      return;
    }
    function apply() {
      var term = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var visible = !term || text.indexOf(term) !== -1;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = shown + ' 部影片';
      }
    }
    input.addEventListener('input', apply);
    apply();
  }

  function initVideo(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    var source = video.querySelector('source');
    var streamUrl = source ? source.getAttribute('src') : '';
    if (!streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    }
    video.dataset.ready = '1';
  }

  function setPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.play-toggle', shell);
      if (!video) {
        return;
      }
      function play() {
        initVideo(video);
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-search="' + escapeHtml(item.searchText || '') + '">' +
      '<a class="poster" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-glow"></span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<div class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>' +
      '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setSearchPage() {
    var root = qs('#search-results');
    if (!root || !window.SEARCH_DATA) {
      return;
    }
    var input = qs('#search-page-input');
    var title = qs('#search-title');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    var term = query.toLowerCase();
    var list = window.SEARCH_DATA.filter(function (item) {
      return !term || String(item.searchText || '').toLowerCase().indexOf(term) !== -1;
    });
    if (title) {
      title.textContent = query ? '“' + query + '”的搜索结果' : '全部可搜索内容';
    }
    if (!list.length) {
      root.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
      return;
    }
    root.innerHTML = list.slice(0, 240).map(cardTemplate).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setMobileNav();
    setCarousel();
    setPageFilter();
    setPlayers();
    setSearchPage();
  });
})();
