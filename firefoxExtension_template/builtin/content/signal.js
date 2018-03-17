"use strict";

// Listen for message from page
window.addEventListener("message", function(event) {
  if (event.source != window) return;
  if (event.data == null) return;
  if (typeof event.data !== 'object') return;
  let mute = event.data.tlf_audio_queue_mute_signal;
  if (mute == null) return;
  if (typeof mute !== 'boolean') return;
  // Pass message to background script
  console.log('got message');
  browser.runtime.sendMessage({"tlf_audio_queue_mute_signal": mute});
});