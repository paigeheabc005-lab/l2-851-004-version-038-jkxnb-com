import { H as Hls } from './hls-dru42stk.js';

function initPlayer(shell) {
  const video = shell.querySelector('.js-hls-player');
  const status = shell.querySelector('[data-player-status]');
  const playButton = shell.querySelector('[data-player-play]');

  if (!video) {
    return;
  }

  const source = video.dataset.src;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function markReady() {
    shell.classList.add('is-ready');
    setStatus('点击播放');
  }

  function markError(message) {
    shell.classList.remove('is-ready');
    shell.classList.remove('is-playing');
    setStatus(message || '视频加载失败，请稍后重试');
  }

  if (!source) {
    markError('未找到播放源');
    return;
  }

  try {
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          markError('视频加载失败，请稍后重试');
          if (hls) {
            hls.destroy();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', markReady, { once: true });
    } else {
      markError('当前浏览器不支持 HLS 播放');
    }
  } catch (error) {
    markError('播放器初始化失败');
  }

  async function togglePlay() {
    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      setStatus('请再次点击播放');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', togglePlay);
  }

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
    if (shell.classList.contains('is-ready')) {
      setStatus('点击继续播放');
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
