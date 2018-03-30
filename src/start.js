"use strict";

// Make pquire and log global
global.pquire = require("pquire").withBaseRelative("./");
global.log = require("tlf-log");

// Parse command line opts (doesn't need to be called, just referencing it is enough);
pquire("cmdLineArgs");

// Local imports
const {version} = pquire("settings");


// Go go gadget async!
(async function() {
  // Sections
  const player = pquire("player/main");
  const server = pquire("server/main");
  
  // Start 'er up!
  try {
    log.info(`Starting Audio Queue v${version}`);
    var p = player.start();
    var s = server.start();
    
    await p; await s;
  } catch (e) {
    console.log(e);
  }
})();