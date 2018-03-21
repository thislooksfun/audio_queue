"use strict";

// Local imports
const log   = pquire("helper/log");
const queue = pquire("helper/queue");

module.exports = {
  register(app) {
    log.trace(" > Setting up api routes (v1)");
    app.post("/api/queue", function(req, res) {
      queue.add({serviceName: "youtube", id: req.body.id, name: "????", length: 4});
      res.json({success: true});
    });
  }
};