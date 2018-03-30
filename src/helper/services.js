"use strict";

// Global imports
const fs = require("fs-extra");
const path = require("path");
// Local imports
const manifest      = pquire("manifest");
const {projectRoot} = pquire("misc");

var services = {};

module.exports = {
  load: async function() {
    var ffExtPath = path.join(projectRoot, "firefoxExtension");
    var ffExtManPath = path.join(ffExtPath, "manifest.json");
    fs.removeSync(ffExtPath);
    fs.copySync(path.join(projectRoot, "firefoxExtension_template"), ffExtPath);
    var ffExtManifest = require(ffExtManPath);
    
    // Load services
    var servicesPath = path.join(projectRoot, "services");
    for (var s of fs.readdirSync(servicesPath)) {
      var mnfst = manifest.parse(servicesPath, s, ffExtPath);
      if (mnfst != null) {
        services[mnfst.name] = {prep: mnfst.prep, play: mnfst.play};
        
        // TODO: Process the extension script stuff in helper/manifest.js
        if (mnfst.extension != null) {
          ffExtManifest.content_scripts.push(mnfst.extension);
        }
      }
    }
    
    fs.writeFileSync(ffExtManPath, JSON.stringify(ffExtManifest, null, 2));
    return services;
  },
  
  getService(name) {
    var s = services[name];
    if (s == null) log.fatal(`Tried to get unregisterd service by name '${name}'`);
    return s;
  }
};