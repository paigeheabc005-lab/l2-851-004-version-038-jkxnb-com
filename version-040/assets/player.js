(function () {
  "use strict";

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var hlsInstance = null;
    var attached = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlay() {
      attachSource();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", startPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });
    video.addEventListener("playing", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
