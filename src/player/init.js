"use strict";

//

// Local imports
const services = pquire("helper/services");

// The actual init function
module.exports = async function() {
  log.trace("Initalizing...");
  
  log.debug("Loading services...");
  log._indent();
  await services.load();
  log._deindent();
};