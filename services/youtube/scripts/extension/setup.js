"use strict";

var vid = document.querySelector("#player .html5-main-video");
console.log(vid);

function afterVidLoad() {
  console.log("Video loaded");
  
  var wjo = window.wrappedJSObject;

  wjo.tlf_YTPlayer = cloneInto({status: "unknown"}, window);
  var ytp = wjo.tlf_YTPlayer;

  function selectorVisible(selector) {
    return document.querySelector(selector).offsetParent !== null;
  }

  setInterval(function() {
    var adShown = selectorVisible("#player .video-ads");
    var videoAd = adShown && selectorVisible("#player .video-ads .videoAdUi");
    console.log(adShown, videoAd);
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
  
}

if (vid.readyState === 0) {
  // Video is not loaded, wait until it is
  vid.addEventListener("loadeddata", afterVidLoad);
} else {
  // Video is already loaded, start setup
  afterVidLoad();
}