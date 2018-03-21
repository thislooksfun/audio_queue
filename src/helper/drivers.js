"use strict";

// Global imports
const path      = require("path");
const fs        = require("fs-extra");
const webdriver = require("selenium-webdriver");
const firefox   = require("selenium-webdriver/firefox");
// Local imports
const {projectRoot} = pquire("misc");

// Get the Firefox binary path
const ffBinary = fs.readFileSync(path.join(projectRoot, "ff_bin_path.txt"), "utf-8");

// Add the Firefox extension
const profile = new firefox.Profile();
profile.setPreference("xpinstall.signatures.required", false);
profile.addExtension(path.join(projectRoot, "firefoxExtension"));

// Set the Firefox options
const firefoxOptions = new firefox.Options();
firefoxOptions.setBinary(ffBinary);
firefoxOptions.setProfile(profile);
// firefoxOptions.headless();

module.exports = {
  // Creates a new driver
  newDriver() { return new webdriver.Builder().forBrowser("firefox").setFirefoxOptions(firefoxOptions).build(); }
};