"use strict";

//

// Local imports
const services = pquire("helper/services");

// The actual init function
module.exports = async function() {
  log.trace("Initalizing...");
  
  log.debug("Loading services...");
  await services.load();
};