import { H as Hls } from './hls-vendor-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-player-button]');
    var status = container.querySelector('[data-player-status]');
    var source = container.getAttribute('data-src');
    var started = false;
    var hlsInstance = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function startPlayback() {
        if (!video || started) {
            return;
        }

        if (!source) {
            setStatus('播放源暂不可用');
            return;
        }

        started = true;
        if (button) {
            button.classList.add('is-hidden');
        }
        setStatus('正在加载播放源...');

        try {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('播放源已加载');
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已加载');
                });
                hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络异常，正在重试...');
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体异常，正在恢复...');
                        hlsInstance.recoverMediaError();
                    } else {
                        setStatus('播放失败，请刷新页面重试');
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = source;
                setStatus('当前浏览器将尝试直接播放');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('已加载，请点击播放器继续播放');
                });
            }
        } catch (error) {
            setStatus('播放器初始化失败');
            console.error(error);
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (!started) {
                startPlayback();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
