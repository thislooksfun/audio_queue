"use strict";

// Global imports
const ip          = require("ip");
const path        = require("path");
const express     = require("express");
const bodyParser  = require("body-parser");
// Local imports
const {projectRoot} = pquire("helper/misc");
const {port}        = pquire("settings");

// Server phases
const frontend = pquire("frontend");
const bonjour  = pquire("bonjour");

const webRoot = path.join(projectRoot, "web");

module.exports = {
  async start() {
    try {
      log.info("Starting server...");
      log._prefix(" > ");
      
      // Configure app
      let app = express();
      // app.set('views', path.join(webRoot, 'html'));
      app.use("/static", express.static(path.join(webRoot, "public")));
      app.use(bodyParser.json());
      
      // Register endpoints
      frontend.register(app, webRoot);
      
      // Register API v1
      log.trace("Setting up search route (v1)");
      
      var apiV1Router = express.Router();
      log._prefix("(v1) ");
      pquire.each("api/v1", (p) => p.register(apiV1Router, webRoot));
      app.use("/api/v1", apiV1Router);
      log._deprefix();
      
      // Start server
      log.trace("Starting server");
      log._deprefix();
      
      app.listen(port);
      log.info(`Server started at ${ip.address()}:${port}`);
      
      // Advertise on Bonjour
      bonjour.publish();
    } catch (e) {
      log.fatal(e);
    }
  }
};