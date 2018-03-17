"use strict";

const {sleep} = require('./helper/util');
const log     = require('./helper/log');

const init = require('./init');
const run  = require('./run');

(async function() {
  try {
    await init();
    await sleep(1000);
    await run();
  } catch (e) {
    log.fatal(e);
  }
})();