"use strict";

const log = require('./helper/log');
const {version} = require('./settings');

const player = require('./player/main');
const server = require('./server/main');

(async function() {
  try {
    log.info(`Starting Audio Queue v${version}`)
    var p = player.start();
    var s = server.start();
    
    await p; await s;
  } catch (e) {
    console.log(e);
  }
})();