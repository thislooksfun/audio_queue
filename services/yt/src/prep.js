const {By, until} = require('selenium-webdriver');
const {scripts, urls} = require('./constants');

const baseURL = 'https://www.youtube.com/watch?v=';

module.exports = async function(driver, item, log) {
  log.trace('Prepping...');
  try {
    // Load the page
    await driver.get(baseURL + item.id);
    
    // Wait until the video has appeared
    await driver.wait(until.elementLocated(By.css('#player .html5-main-video')));
    
    // Run setup scripts
    await driver.executeScript(scripts.setup);
    
    // Disable autoplay
    await driver.wait(until.elementLocated(By.css('#autoplay + #toggle')));
    try {
      driver.wait(until.elementLocated(By.css('#autoplay + #toggle[aria-pressed="true"]'))).click();
    } catch (e) {} // If the element wasn't found, ignore it.
    
    // Wait for pre-roll to finish
    while (true) {
      var info = await driver.executeScript(scripts.status);
      log.debug(info);
      if (info.status == 'preroll' && info.canSkipAd) {
        console.log('a');
        await driver.sleep(1000);
        console.log('b');
        await driver.findElement(By.css('#player .video-ads .videoAdUiSkipButton')).click();
        console.log('c');
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