"use strict";

// Global imports
const path       = require('path');
const express    = require('express');
const bodyParser = require('body-parser');
// Local imports
const log   = require('../helper/log');
const queue = require('../helper/queue');


const app = express();

module.exports = {
  async start() {
    log.info('Starting server...');
    
    // app.set('views', './web/html')
    
    app.use('/static', express.static(__dirname + '/web/public'));
    app.use(bodyParser.json());
    
    app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname, 'web/html/home.htm'));
    });
    
    app.post('/api/queue', function(req, res) {
      queue.add({serviceName: 'youtube', id: req.body.id, name: '????', length: 4});
      res.json({success: true});
    });
    
    app.listen(4444);
    log.info('Server started');
  }
}