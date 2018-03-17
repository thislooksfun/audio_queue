"use strict";

const path        = require('path');
const fs          = require('fs-extra');
const log         = require('./helper/log');
const manifest    = require('./helper/manifest');
const webdriver   = require('selenium-webdriver');
const firefox     = require('selenium-webdriver/firefox');
const ffExt       = require('selenium-webdriver/firefox/extension');
const proxy       = require('selenium-webdriver/proxy');
const {By, until} = webdriver;

const ffBinary = fs.readFileSync(path.join(__dirname, '../ff_bin_path.txt'), 'utf-8');

const profile = new firefox.Profile();
profile.setPreference("xpinstall.signatures.required", false);
profile.addExtension(path.join(__dirname, '../firefoxExtension_template'));

const firefoxOptions = new firefox.Options();
firefoxOptions.setBinary(ffBinary);
firefoxOptions.setProfile(profile);
// firefoxOptions.headless();
function newDriver() { return new webdriver.Builder().forBrowser('firefox').setFirefoxOptions(firefoxOptions).build(); }

// Load services
var services = {};
(async function() {
  var ffExtPath = path.join(__dirname, '../firefoxExtension');
  var ffExtManPath = path.join(ffExtPath, 'manifest.json');
  fs.removeSync(ffExtPath);
  fs.copySync(path.join(__dirname, '../firefoxExtension_template'), ffExtPath);
  var ffExtManifest = require(ffExtManPath);
  
  var servicesPath = path.join(__dirname, '../services');
  for (var s of fs.readdirSync(servicesPath)) {
    var mnfst = manifest.parse(servicesPath, s);
    if (mnfst != null) {
      services[mnfst.name] = {prep: mnfst.prep, play: mnfst.play};
      if (mnfst.raw.extension) {
        ffExtManifest.content_scripts.push(mnfst.raw.extension);
      }
    }
  }
  
  fs.writeFileSync(ffExtManPath, JSON.stringify(ffExtManifest));
  setTimeout(start, 1000);
})();


function start() {
  log.info("Starting...");
  // Item format: {serviceName: string, id: string, name: string, length: number}
  var queue = [
    {serviceName: 'youtube', id: process.argv[3], name: '??', length: 100},
    {serviceName: 'youtube', id: process.argv[4], name: '??', length: 100}
  ];
  
  async function getAndPrepNext() {
    var item = queue.shift();
    if (item == null) {
      next = null;
      return;
    }
    
    
    next = { driver: newDriver(), item: item, service: services[item.serviceName] };
    await next.service.prep(next.driver, next.item, log);
    next.ready = true;
  }
  
  var current = null;
  var next = null;
  
  async function addToQueue(item) {
    queue.push(item);
    
    // If we just added the only thing in the queue, and nothing else was prepped, get set up.
    if (queue.length == 1 && next == null)
      await getAndPrepNext();
  }
  
  setTimeout(function() {addToQueue({serviceName: 'youtube', id: process.argv[5], name: '??', length: 100})}, 60*1000);
  setTimeout(function() {addToQueue({serviceName: 'youtube', id: process.argv[6], name: '??', length: 100})}, 120*1000);
  
  (async function run() {
    try {
      var play;
      
      if (current != null)
        play = current.service.play(current.driver, current.item, log);
      
      if (next == null)
        await getAndPrepNext();
      
      if (current != null) {
        await play;
        current.driver.quit();
      }
      
      if (next == null || next.ready) {
        current = next;
        next = null;
      }
      
      var nothingQueued = (current == null && next == null && queue.length === 0)
      setTimeout(run, nothingQueued ? 1000 : 0);
      
    } catch (err) {
      log.error(err);  // Something went wrong!
    }
  })();
}