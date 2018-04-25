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
  async init() {
    try {
      log.info("Initalizing server...");
      log._prefix(" > ");
      
      // Configure app
      this.app = express();
      // app.set('views', path.join(webRoot, 'html'));
      this.app.use("/static", express.static(path.join(webRoot, "public")));
      this.app.use(bodyParser.json());
      
      // Register endpoints
      frontend.register(this.app, webRoot);
      
      // Register API v1
      log.trace("Setting up search route (v1)");
      
      var apiV1Router = express.Router();
      log._prefix("(v1) ");
      pquire.each("api/v1", (p) => p.register(apiV1Router, webRoot));
      this.app.use("/api/v1", apiV1Router);
      log._deprefix();
      log._deprefix();
    } catch (e) {
      log.fatal(e);
    }
  },
  
  async start() {
    try {
      // Start server
      log.info("Starting server...");
      log._prefix(" > ");
      
      this.app.listen(port);
      log.info(`Server started at ${ip.address()}:${port}`);
      
      // Advertise on Bonjour
      bonjour.publish();
      log._deprefix();
    } catch (e) {
      log.fatal(e);
    }
  }
};