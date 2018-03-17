var vid = document.querySelector('#player .html5-main-video');

window.tlf_YTPlayer = {status: 'unknown', shouldBePlaying: false};

function selectorVisible(selector) {
  return getComputedStyle(document.querySelector(selector), null).display !== 'none';
}

var hasLoaded = false;

// Mute when anything happens
var mediaEvents = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'interruptbegin',
  'interruptend',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mozaudioavailable',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
];

function eventHappened() {
  var lg1 = 'b4: ' + vid.muted + ':' + vid.volume;
  
  var sbp = window.tlf_YTPlayer.shouldBePlaying;
  vid.muted = !sbp;
  vid.volume = spb ? 1.0 : 0.0;
  
  var lg2 = 'af: ' + vid.muted + ':' + vid.volume;
  
  console.log(lg1 + ' ' + lg2);
}

for (evt of mediaEvents) {
  vid.addEventListener(evt, eventHappened, true);
}

setInterval(function() {
  vid.muted = !window.tlf_YTPlayer.shouldBePlaying;
  
  var adShown = selectorVisible('#player .video-ads');
  var videoAd = adShown && selectorVisible('#player .video-ads .videoAdUi');
  
  if (adShown && videoAd) {
    vid.muted = true;
    if (window.tlf_YTPlayer.status === 'main') {
      window.tlf_YTPlayer.status = 'postroll';
    } else {
      window.tlf_YTPlayer.status = 'preroll';
      window.tlf_YTPlayer.canSkipAd = selectorVisible('#player .video-ads .videoAdUiSkipButton');
    }
  } else {
    // Playing main video, possibly with a popup ad
    window.tlf_YTPlayer.status = 'main';
    window.tlf_YTPlayer.canSkipAd = undefined;
  }
}, 50);