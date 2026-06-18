(function () {
  const headerForms = document.querySelectorAll('[data-header-search]');
  headerForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input');
      const value = input ? input.value.trim() : '';
      const target = value ? './movies.html?q=' + encodeURIComponent(value) : './movies.html';
      window.location.href = target;
    });
  });

  const toggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  const dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function scheduleSlides() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
    }
    if (slides.length > 1) {
      slideTimer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      scheduleSlides();
    });
  });

  showSlide(0);
  scheduleSlides();

  const cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  const filterSearch = document.querySelector('[data-filter-search]');
  const filterYear = document.querySelector('[data-filter-year]');
  const filterRegion = document.querySelector('[data-filter-region]');
  const filterType = document.querySelector('[data-filter-type]');
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const keyword = normalize(filterSearch && filterSearch.value);
    const year = normalize(filterYear && filterYear.value);
    const region = normalize(filterRegion && filterRegion.value);
    const type = normalize(filterType && filterType.value);
    let visible = 0;

    cards.forEach(function (card) {
      const searchText = normalize(card.dataset.search);
      const cardYear = normalize(card.dataset.year);
      const cardRegion = normalize(card.dataset.region);
      const cardType = normalize(card.dataset.type);
      const matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      const matchYear = !year || cardYear === year;
      const matchRegion = !region || cardRegion.indexOf(region) !== -1;
      const matchType = !type || cardType.indexOf(type) !== -1;
      const matched = matchKeyword && matchYear && matchRegion && matchType;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [filterSearch, filterYear, filterRegion, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (filterSearch) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      filterSearch.value = query;
    }
  }
  applyFilters();

  let hlsLoader = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  const players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }
    const stream = video.dataset.stream;
    let ready = false;
    let hlsInstance = null;

    async function prepare() {
      if (ready || !stream) {
        return;
      }
      if (/\.m3u8(\?|$)/i.test(stream) && !video.canPlayType('application/vnd.apple.mpegurl')) {
        const HlsConstructor = await loadHls();
        if (HlsConstructor && HlsConstructor.isSupported()) {
          hlsInstance = new HlsConstructor({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      } else {
        video.src = stream;
      }
      ready = true;
    }

    async function start() {
      player.classList.add('is-playing');
      video.controls = true;
      try {
        await prepare();
        await video.play();
      } catch (error) {
        player.classList.remove('is-playing');
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
