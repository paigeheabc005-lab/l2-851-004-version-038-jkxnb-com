(function () {
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
})();

(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var backs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-bg]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  var active = 0;
  var timer = null;
  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.hidden = i !== active;
    });
    backs.forEach(function (bg, i) {
      bg.classList.toggle("active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === active);
    });
  }
  function play() {
    timer = window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      window.clearInterval(timer);
      show(i);
      play();
    });
  });
  show(0);
  play();
})();

(function () {
  var lists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));
  if (!lists.length) {
    return;
  }
  var queryInput = document.querySelector("[data-search-input]");
  var categorySelect = document.querySelector("[data-category-filter]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  if (queryInput && initialQuery) {
    queryInput.value = initialQuery;
  }
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }
  function yearMatch(cardYear, selected) {
    if (selected === "all") {
      return true;
    }
    if (selected === "2022") {
      return Number(cardYear) <= 2022;
    }
    return String(cardYear) === selected;
  }
  function filterCards() {
    var term = normalize(queryInput ? queryInput.value : "");
    var selectedCategory = categorySelect ? categorySelect.value : "all";
    var selectedYear = yearSelect ? yearSelect.value : "all";
    lists.forEach(function (list) {
      Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.year
        ].join(" "));
        var passTerm = !term || haystack.indexOf(term) !== -1;
        var passCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
        var passYear = yearMatch(card.dataset.year, selectedYear);
        card.classList.toggle("hidden-by-filter", !(passTerm && passCategory && passYear));
      });
    });
  }
  [queryInput, categorySelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });
  filterCards();
})();

(function () {
  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("image-missing");
    }
  }, true);
})();

(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  if (!players.length) {
    return;
  }
  players.forEach(function (root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".player-start");
    var source = root.getAttribute("data-stream");
    var hls = null;
    function attachSource() {
      if (!video || !source || video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.ready = "1";
    }
    function start() {
      attachSource();
      root.classList.add("is-playing");
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          root.classList.remove("is-playing");
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
