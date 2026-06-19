(function () {
    function startMoviePlayer(videoId, buttonId, statusId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var status = document.getElementById(statusId);
        var hls = null;
        var ready = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function hideButton() {
            button.classList.add('is-hidden');
        }

        function showButton() {
            button.classList.remove('is-hidden');
        }

        function attachStream() {
            if (ready) {
                return;
            }
            ready = true;
            video.crossOrigin = 'anonymous';
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('');
                }, { once: true });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('视频加载失败，请稍后重试');
                        showButton();
                    }
                });
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            attachStream();
            hideButton();
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    setStatus('点击播放器继续观看');
                    showButton();
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', hideButton);
        video.addEventListener('pause', function () {
            if (!video.ended) {
                showButton();
            }
        });
        video.addEventListener('ended', showButton);
        attachStream();
    }

    window.startMoviePlayer = startMoviePlayer;
})();
