"use strict";

const {sleep} = require('../helper/misc');
const log     = require('../helper/log');

const init = require('./init');
const run  = require('./run');

module.exports = {
  async start() {
    try {
      log.info('Staring player...');
      await init();
      await sleep(1000);
      await run();
    } catch (e) {
      log.fatal(e);
    }
  }
};