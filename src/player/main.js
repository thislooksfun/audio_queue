"use strict";

// Local imports
const {sleep} = pquire("helper/misc");
const init    = pquire("init");
const run     = pquire("run");

module.exports = {
  async init() {
    try {
      log.info("Initializing player...");
      await init();
      await sleep(1000);
    } catch (e) {
      log.fatal(e);
    }
  },
  
  async start() {
    try {
      log.info("Starting player...");
      await run();
    } catch (e) {
      log.fatal(e);
    }
  }
};