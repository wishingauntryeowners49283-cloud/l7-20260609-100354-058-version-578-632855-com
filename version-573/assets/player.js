function startMoviePlayer(videoUrl) {
  var video = document.querySelector('.movie-player-video');
  var overlay = document.querySelector('.player-overlay');
  var hls;
  var isReady = false;

  if (!video || !overlay || !videoUrl) {
    return;
  }

  function attach() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = videoUrl;
    isReady = true;
  }

  function play() {
    attach();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
