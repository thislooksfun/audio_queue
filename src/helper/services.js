"use strict";

// Global imports
const fs = require("fs-extra");
const path = require("path");
// Local imports
const flatten       = pquire("flatten");
const manifest      = pquire("manifest");
const {projectRoot} = pquire("misc");

var services = {};

function buildSearch(searchFn, name) {
  return async function(query) {
    let res = await searchFn(query);
    for (var r of res) {
      r.serviceName = name;
    }
    return res;
  };
}

function buildGetInfo(infoFn, name) {
  return async function(query) {
    let res = await infoFn(query);
    res.serviceName = name;
    return res;
  };
}

module.exports = {
  // If this is made async, then where it is called in 'init.js' needs to be changed to 'await'
  load: function() {
    var ffExtPath = path.join(projectRoot, "firefoxExtension");
    var ffExtManPath = path.join(ffExtPath, "manifest.json");
    fs.removeSync(ffExtPath);
    fs.copySync(path.join(projectRoot, "firefoxExtension_template"), ffExtPath);
    var ffExtManifest = require(ffExtManPath);
    
    // Load services
    var servicesPath = path.join(projectRoot, "services");
    log.debug("Loading all services from path '" + servicesPath + "'");
    log._indent();
    for (var s of fs.readdirSync(servicesPath)) {
      log.debug("Loading service '" + s + "'");
      var mnfst = manifest.parse(servicesPath, s, ffExtPath);
      if (mnfst != null) {
        let search = buildSearch(mnfst.search, mnfst.name);
        let getInfo = buildGetInfo(mnfst.getInfo, mnfst.name);
        services[mnfst.name] = {prep: mnfst.prep, play: mnfst.play, search: search, getInfo: getInfo};
        
        // TODO: Process the extension script stuff in helper/manifest.js
        if (mnfst.extension != null) {
          ffExtManifest.content_scripts.push(mnfst.extension);
        }
      }
    }
    log._deindent();
    
    fs.writeFileSync(ffExtManPath, JSON.stringify(ffExtManifest, null, 2));
    return services;
  },
  
  getService(name) {
    var s = services[name];
    if (s == null) log.fatal(`Tried to get unregistered service by name '${name}'`);
    return s;
  },
  
  async search(query) {
    var results = [];
    
    for (var name in services) {
      let s = services[name];
      let res = await s.search(query);
      results.push(res);
    }
    
    return flatten(results);
  }
};