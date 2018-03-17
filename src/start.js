"use strict";

const player = require('./player/main');
const server = require('./server/main');

(async function() {
  try {
    var p = player.start();
    var s = server.start();
    
    await p; await s;
  } catch (e) {
    console.log(e);
  }
})();