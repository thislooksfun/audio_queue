"use strict";

// Global imports
const path = require("path");

module.exports = {
  register(app, webRoot) {
    log.trace("Setting up frontend routes");
    app.get("/", function(req, res) {
      res.sendFile(path.join(webRoot, "html/home.htm"));
    });
  },
};