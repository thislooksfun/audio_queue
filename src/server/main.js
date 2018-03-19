"use strict";

// Global imports
const path        = require('path');
const bonjour     = require('bonjour')();
const express     = require('express');
const bodyParser  = require('body-parser');
const nodeCleanup = require('node-cleanup');
// Local imports
const log   = require('../helper/log');
const queue = require('../helper/queue');
// Settings
const {port, version, bonjour_name} = require('../settings');
const {projectRoot} = require('../helper/misc');

const webRoot = path.join(projectRoot, 'web');

const app = express();

// Unpublish bonjour before exiting.
nodeCleanup(function (exitCode, signal) {
  // If there are any bonjour services open, unpublish them and then exit
  log.trace('Cleaning up...');
  if (bonjour._registry._services.length > 0) {
    log.trace(' > Unpublishing Bonjour service')
    bonjour.unpublishAll(() => {process.exit(exitCode);});
    return false;
  } else {
    log.trace(' > Bonjour service unpublished, exiting...');
  }
});

module.exports = {
  async start() {
    log.info('Starting server...');
    
    log.trace(' > Publishing Bonjour service');
    // let a = bonjour.publish({name: bonjour_name, type: 'tlfcustomtype', port: port, subtypes: [], txt: {version: version}});
    let a = bonjour.publish({name: bonjour_name, type: 'http2', port: port, subtypes: [], txt: {version: version}});
    log.debug(a.type);
        
    // app.set('views', path.join(webRoot, 'html'));
    
    log.trace(' > Publishing Bonjour service');
    app.use('/static', express.static(path.join(webRoot, 'public')));
    app.use(bodyParser.json());
    
    log.trace(' > Setting up routes');
    app.get('/', function(req, res) {
      res.sendFile(path.join(webRoot, 'html/home.htm'));
    });
    app.post('/api/queue', function(req, res) {
      queue.add({serviceName: 'youtube', id: req.body.id, name: '????', length: 4});
      res.json({success: true});
    });
    
    log.trace(' > Starting server');
    app.listen(port);
    log.info(`Server started on port ${port}`);
  }
}