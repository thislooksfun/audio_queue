"use strict";

// Local imports
const queue = pquire("helper/queue");
const services = pquire("helper/services");

module.exports = {
  register(app) {
    log.trace(" > Setting up api routes (v1)");
    
    app.post("/api/queue", function(req, res) {
      queue.add({serviceName: "youtube", id: req.body.id, name: "????", length: 4});
      res.json({success: true});
    });
    
    app.post("/api/v1/search", async function(req, res) {
      let data = await services.search(req.query.q);
      res.json({success: true, data: data});
    });
  }
};