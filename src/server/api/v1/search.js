"use strict";

// Local imports
const services = pquire("helper/services");

module.exports = {
  register(router) {
    log.trace("Setting up search route");
    
    router.get("/search", async function(req, res) {
      let data = await services.search(req.query.q);
      res.json({success: true, data: data});
    });
  }
};