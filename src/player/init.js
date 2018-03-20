"use strict";

// Local imports
const log      = require("../helper/log");
const services = require("../helper/services");

// The actual init function
module.exports = async function() {
  log.trace("Initalizing...");
  await services.load();
  // await drivers.init();
};