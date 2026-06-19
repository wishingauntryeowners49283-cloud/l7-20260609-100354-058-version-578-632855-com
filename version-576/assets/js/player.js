(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('.movie-player');
        var button = shell.querySelector('.player-play');
        var errorBox = shell.querySelector('.player-error');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');

        function showError() {
            if (errorBox) {
                errorBox.hidden = false;
            }
        }

        function bindStream() {
            if (!stream) {
                showError();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showError();
                    hls.destroy();
                });
                window.addEventListener('beforeunload', function () {
                    hls.destroy();
                });
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }
            video.src = stream;
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(showError);
            }
        }

        bindStream();

        if (button) {
            button.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });
        video.addEventListener('error', showError);
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
    });
}());
