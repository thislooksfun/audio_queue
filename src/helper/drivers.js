"use strict";

// Global imports
const path      = require("path");
const fs        = require("fs-extra");
const webdriver = require("selenium-webdriver");
const chrome   = require("selenium-webdriver/chrome");
// Local imports
const {projectRoot} = pquire("misc");
const {headless}    = pquire("settings");

// Add to the PATH
log.trace("Adding './bin' to path");
process.env.PATH += ":" + path.join(process.cwd(), "bin");
log.debug("PATH after adding './bin' :: ", process.env.PATH);

// Get the Chrome binary path
const chromeBinary = fs.readFileSync(path.join(projectRoot, "chrome_bin_path.txt"), "utf-8");

// Set the Chrome options
const chromeOptions = new chrome.Options();
chromeOptions.setChromeBinaryPath(chromeBinary);
chromeOptions.addArguments("load-extension=" + path.join(projectRoot, "chromeExtension"));
if (headless) {
  log.trace("Settings drivers to headless mode");
  chromeOptions.headless();
}

module.exports = {
  // Creates a new driver
  newDriver() { return new webdriver.Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build(); }
};