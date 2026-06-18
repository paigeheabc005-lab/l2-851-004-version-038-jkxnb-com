(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }

        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filters = {};

        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter-select")] = select.value;
        });

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = !query || text.indexOf(query) !== -1;

          Object.keys(filters).forEach(function (key) {
            var value = filters[key];
            if (value && card.getAttribute("data-" + key) !== value) {
              ok = false;
            }
          });

          card.classList.toggle("is-hidden", !ok);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
    });
  });

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.getElementById("player-overlay");
      var message = document.getElementById("player-message");
      var hls = null;
      var loaded = false;

      if (!video || !streamUrl) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("is-visible");
        }
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                showMessage("当前视频暂时无法播放");
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          showMessage("当前视频暂时无法播放");
        }
      }

      function start() {
        load();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };
})();
