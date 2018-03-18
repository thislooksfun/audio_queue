"use strict";

const {By, until} = require('selenium-webdriver');
const {scripts, urls} = require('./constants');

const baseURL = 'https://www.youtube.com/watch?v=';

module.exports = async function(driver, item, log) {
  log.trace('Prepping...');
  try {
    // Load the page
    log.debug(`Opening page ${baseURL + item.id}`);
    await driver.get(baseURL + item.id);
    
    // Disable autoplay
    log.debug('Disabling autoplay')
    await driver.wait(until.elementLocated(By.css('#autoplay + #toggle')));
    try {
      driver.wait(until.elementLocated(By.css('#autoplay + #toggle[aria-pressed="true"]'))).click();
    } catch (e) {} // If the element wasn't found, ignore it.
    
    // Wait for 2 seconds to let everything (hopefully) catch up.
    await driver.sleep(2000);
    
    // Wait for pre-roll to finish
    while (true) {
      var info = await driver.executeScript(scripts.status);
      log.debug('Prepping', info);
      if (info.status == 'preroll' && info.canSkipAd) {
        try {
          await driver.findElement(By.css('#player .video-ads .videoAdUiSkipButton')).click();
        } catch (e) {
          log.warn(e);
        }
      }
      if (info.status == 'main') break;
      await driver.sleep(1000);
    }
    
    // Prep the video
    await driver.executeScript(scripts.prep);
    
  } catch (err) {
    log.error(err);  // Something went wrong!
  }
  log.trace('Prep done!');
};