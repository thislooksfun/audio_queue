"use strict";

// Local imports
const log      = pquire("helper/log");
const services = pquire("helper/services");

// The actual init function
module.exports = async function() {
  log.trace("Initalizing...");
  await services.load();
  // await drivers.init();
};