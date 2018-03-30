"use strict";

// Local imports
const {sleep} = pquire("helper/misc");
const init    = pquire("init");
const run     = pquire("run");

module.exports = {
  async start() {
    try {
      log.info("Staring player...");
      await init();
      await sleep(1000);
      await run();
    } catch (e) {
      log.fatal(e);
    }
  }
};