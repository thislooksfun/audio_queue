const {By, until} = require('selenium-webdriver');
const {scripts, urls} = require('./constants');

module.exports = async function(driver, item, log) {
  log.trace('Playing...');
  try {
    // Start the video
    driver.executeScript(scripts.play);
    
    // Wait for video to finish
    while (true) {
      var info = await driver.executeScript(scripts.status);
      log.debug(info);
      if (info.ended || info.status == 'postroll') break;
      await driver.sleep(1000);
    }
  } catch (err) {
    log.error(err);  // Something went wrong!
  }
  log.trace('Playing done!');
}