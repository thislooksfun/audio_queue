"use strict";

const log      = require('./log');
const drivers  = require('./drivers');
const services = require('./services');

// Item format: {serviceName: string, id: string, name: string, length: number}
var queue = [];

module.exports = {
  current: null,
  next: null,
  
  async add(i) {
    log.trace(`Adding item ${i.name} to the queue`)
    log.debug(i);
    queue.push(i);
    if (queue.length === 1 && this.next === null) {
      await this.getAndPrepNext();
    }
  },
  
  async getAndPrepNext() {
    if (queue.length === 0) {
      this.next = null;
      return null;
    }
    
    var item = queue.shift();
    
    var n = { driver: drivers.newDriver(), item: item, service: services.getService(item.serviceName) };
    await n.service.prep(n.driver, n.item, log);
    n.ready = true;
    this.next = n;
  },
  
  get empty() { return queue.length === 0; },
}