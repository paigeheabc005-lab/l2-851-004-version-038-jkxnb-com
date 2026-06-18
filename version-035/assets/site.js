(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");

    if (!panel) {
      return;
    }

    var search = document.getElementById("movie-search");
    var region = document.getElementById("filter-region");
    var type = document.getElementById("filter-type");
    var year = document.getElementById("filter-year");
    var clear = document.getElementById("filter-clear");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");

    if (queryValue && search) {
      search.value = queryValue;
    }

    function clean(value) {
      return String(value || "").trim().toLowerCase();
    }

    function run() {
      var q = clean(search && search.value);
      var r = clean(region && region.value);
      var t = clean(type && type.value);
      var y = clean(year && year.value);

      cards.forEach(function (card) {
        var haystack = clean([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var matched = true;

        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }

        if (r && clean(card.getAttribute("data-region")) !== r) {
          matched = false;
        }

        if (t && clean(card.getAttribute("data-type")) !== t) {
          matched = false;
        }

        if (y && clean(card.getAttribute("data-year")) !== y) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", run);
        control.addEventListener("change", run);
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        if (search) {
          search.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        run();
      });
    }

    run();
  }

  function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var layer = document.getElementById("play-layer");
    var hlsInstance = null;
    var prepared = false;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function start() {
      prepare();

      if (layer) {
        layer.classList.add("is-hidden");
      }

      video.controls = true;
      var playAction = video.play();

      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    prepare();

    if (layer) {
      layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
