"use strict";

// Local imports
const queue = pquire("helper/queue");
const codes = pquire("server/codes/httpCodes");
const services = pquire("helper/services");

module.exports = {
  register(router) {
    log.trace("Setting up queue route");
    
    router.get("/queue", function(req, res) {
      let data = {
        playing: queue.playing,
        prepping: queue.prepping,
        queue: queue.list,
      };
      res.json({success: true, data: data});
    });
    
    router.post("/queue", async function(req, res) {
      if (req.body == null) {
        return res.status(codes.bad_request).json({success: false, error: "Body must be a JSON object"});
      }
      if (typeof req.body.serviceName !== "string" || req.body.serviceName === "") {
        return res.status(codes.bad_request).json({success: false, error: "serviceName must be a non-empty string"});
      }
      if (typeof req.body.id !== "string" || req.body.id === "") {
        return res.status(codes.bad_request).json({success: false, error: "id must be a non-empty string"});
      }
      
      let item = await services.getService(req.body.serviceName).getInfo(req.body.id);
      item.serviceName = req.body.serviceName;
      
      queue.add(item);
      res.json({success: true});
    });
  }
};