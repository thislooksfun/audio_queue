var vid = document.querySelector('#player .html5-main-video');
return {
  status: window.tlf_YTPlayer.status,
  ended: vid.ended,
  remaining: (vid.duration-vid.currentTime) || -1,
  canSkipAd: window.tlf_YTPlayer.canSkipAd
};