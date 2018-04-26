"use strict";

// Global imports
const fs = require("fs-extra");
const path = require("path");
// Local imports
const flatten       = pquire("flatten");
const manifest      = pquire("manifest");
const {projectRoot} = pquire("misc");

var services = {};
let servicesPath = path.join(projectRoot, "services");

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
  load: async function() {
    let ffExtPath = path.join(projectRoot, "firefoxExtension");
    let ffExtManPath = path.join(ffExtPath, "manifest.json");
    fs.removeSync(ffExtPath);
    fs.copySync(path.join(projectRoot, "firefoxExtension_template"), ffExtPath);
    let ffExtManifest = require(ffExtManPath);
    
    // Load services
    log.debug(`Loading all services from path '${servicesPath}'`);
    log._indent();
    let foundNames = {};
    for (let s of fs.readdirSync(servicesPath)) {
      log.debug("Loading service '" + s + "'");
      let mnfst = await manifest.parse(servicesPath, s, ffExtPath);
      if (mnfst != null) {
        foundNames[mnfst.name] = true;
        
        // Don't try to double-load already installed services
        if (services[mnfst.name] == null) {
          let search = buildSearch(mnfst.search, mnfst.name);
          let getInfo = buildGetInfo(mnfst.getInfo, mnfst.name);
          services[mnfst.name] = {name: mnfst.name, prep: mnfst.prep, play: mnfst.play, search: search, getInfo: getInfo, manifest: mnfst};
          
          // TODO: Process the extension script stuff in helper/manifest.js
          if (mnfst.extension != null) {
            ffExtManifest.content_scripts.push(mnfst.extension);
          }
        }
      }
    }
    log._deindent();
    
    let removed = Object.keys(services).filter((el) => foundNames[el] == null);
    if (removed.length > 0) {
      log.debug(`Removing ${removed.length} deleted services...`);
      log._prefix(" > ");
      for (let n of removed) {
        log.debug(`Removing service ${n}...`);
        for (let p of services[n].manifest._reqPaths) {
          delete require.cache[p];
        }
        delete services[n];
      }
      log._deprefix();
    }
    
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