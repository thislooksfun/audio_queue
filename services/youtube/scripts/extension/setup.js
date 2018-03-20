"use strict";

var vid = document.querySelector("#player .html5-main-video");

var wjo = window.wrappedJSObject;

wjo.tlf_YTPlayer = cloneInto({status: "unknown"}, window);
var ytp = wjo.tlf_YTPlayer;

function selectorVisible(selector) {
  return document.querySelector(selector).offsetParent !== null;
}

setInterval(function() {
  var adShown = selectorVisible("#player .video-ads");
  var videoAd = adShown && selectorVisible("#player .video-ads .videoAdUi");
  
  if (adShown && videoAd) {
    if (ytp.status === "main") {
      ytp.status = "postroll";
    } else {
      ytp.status = "preroll";
    }
    ytp.canSkipAd = selectorVisible("#player .video-ads .videoAdUiSkipButton");
  } else {
    vid.muted = false;
    // Playing main video, possibly with a popup ad
    ytp.status = "main";
    ytp.canSkipAd = undefined;
  }
}, 50);