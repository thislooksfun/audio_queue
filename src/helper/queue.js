"use strict";

// Local imports
const drivers  = pquire("drivers");
const services = pquire("services");

// Item format: {serviceName: string, id: string, title: string, length: number}
var queue = [];

module.exports = {
  current: null,
  next: null,
  
  async add(i) {
    log.trace(`Adding item ${i.title} to the queue`);
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
    
    this.next = { driver: drivers.newDriver(), item: item, service: services.getService(item.serviceName), ready: false};
    await this.next.service.prep(this.next.driver, this.next.item, log);
    this.next.ready = true;
  },
  
  get playing() { return (this.current == null) ? null : this.current.item; },
  get prepping() { return (this.next == null) ? null : this.next.item; },
  get list() { return queue; },
  get empty() { return queue.length === 0; },
};