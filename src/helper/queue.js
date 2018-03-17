"use strict";

const log      = require('./log');
const drivers  = require('./drivers');
const services = require('./services');

// Item format: {serviceName: string, id: string, name: string, length: number}
// var queue = [];
var queue = [
  {serviceName: 'youtube', id: process.argv[3], name: '??', length: 100},
  {serviceName: 'youtube', id: process.argv[4], name: '??', length: 100}
];

// setTimeout(function() {addToQueue({serviceName: 'youtube', id: process.argv[5], name: '??', length: 100})}, 60*1000);
// setTimeout(function() {addToQueue({serviceName: 'youtube', id: process.argv[6], name: '??', length: 100})}, 120*1000);

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
    
    this.next = { driver: drivers.newDriver(), item: item, service: services.getService(item.serviceName) };
    await this.next.service.prep(this.next.driver, this.next.item, log);
    this.next.ready = true;
    return this.next;
  },
  
  get empty() { return queue.length === 0; },
}