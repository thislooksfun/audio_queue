(function() {
  "use strict";
  // Mute any new tabs
  browser.tabs.onCreated.addListener(function(tab) { setMute(tab.id, true); });

  // Mute all open tabs
  browser.tabs.query({}).then(function(tabs) {
    for (let tab of tabs) {
      setMute(tab.id, true);
    }
  });

  // Listen for mute/unmute requests from the page
  browser.runtime.onMessage.addListener(onMessage);
  function onMessage(m, sender) {
    setMute(sender.tab.id, m.tlf_audio_queue_mute_signal);
  }

  // Helper function
  function setMute(id, muted) {
    browser.tabs.update(id, {muted: muted});
  }
})();