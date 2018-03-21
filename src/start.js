"use strict";

// Make pquire global
global.pquire = require("pquire");

// Local imports
const log       = pquire("helper/log");
const {version} = pquire("settings");

// Sections
const player = pquire("player/main");
const server = pquire("server/main");


(async function() {
  try {
    log.info(`Starting Audio Queue v${version}`);
    var p = player.start();
    var s = server.start();
    
    await p; await s;
  } catch (e) {
    console.log(e);
  }
})();