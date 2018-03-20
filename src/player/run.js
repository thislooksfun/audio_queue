"use strict";

const log      = require("../helper/log");
const queue    = require("../helper/queue");
const {sleep}  = require("../helper/misc");

const unmuteScript = "window.postMessage({tlf_audio_queue_mute_signal: false}, '*');";

module.exports = async function() {
  try {
    while (true) {
      var play;
      
      if (queue.current != null) {
        queue.current.driver.executeScript(unmuteScript);  // Unmute tab
        play = queue.current.service.play(queue.current.driver, queue.current.item, log);
      }
      
      if (queue.next == null) {
        await queue.getAndPrepNext();
      }
      
      if (queue.current != null) {
        await play;
        queue.current.driver.quit();
      }
      
      if (queue.next == null) {
        queue.current = null;
        if (queue.empty) {
          await sleep(1000);
        }
      } else if (queue.next.ready) {
        queue.current = queue.next;
        queue.next = null;
      } else {
        await sleep(1000);
      }
    }
  } catch (err) {
    log.error(err);  // Something went wrong!
  }
};