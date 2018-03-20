"use strict";

// Global imports
const path = require('path');
// Local imports
const log = require('../helper/log');

module.exports = {
  register(app, webRoot) {
    log.trace(' > Setting up frontend routes');
    app.get('/', function(req, res) {
      res.sendFile(path.join(webRoot, 'html/home.htm'));
    });
  },
}