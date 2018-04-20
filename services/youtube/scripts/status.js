"use strict";

var vid = document.querySelector("#player .html5-main-video");
var ytp = window.tlf_YTPlayer || {};
return {
  status: ytp.status,
  ended: vid.ended,
  remaining: (vid.duration - vid.currentTime) || -1,
  canSkipAd: ytp.canSkipAd
};