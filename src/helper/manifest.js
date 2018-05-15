"use strict";

// Global imports
const fs   = require("fs-extra");
const path = require("path");
const {exec} = require("child_process");

// Local imports
const misc = pquire("misc");

const requiredKeys = {
  name: "string",
  title: "string",
  author: "string",
  home: "string",
  share: "string",
  icon: "string",
  scripts: {
    prep: "string",
    play: "string",
    search: "string",
    info: "string"
  }
};




const ext_requiredKeys = {
  matches: "[string]",
  js: "[object]",
};
function processExtensionInfo(ext, servPath, servName, extPath) {
  if (typeof ext !== "object") {
    return {s: false, msgs: ["Key 'extension' must be a dict"]};
  }
  if (!misc.verifyKeys(servName, ext, ext_requiredKeys, "extension.")) {
    return {s: false};
  }
  
  var servExtPath = path.join(extPath, "scripts", servName);
  fs.mkdirpSync(servExtPath);
  var csJS = [];
  var waJS = [];
  for (var f of ext.js) {
    if (path.extname(f.path) !== ".js") continue;
    
    var fPath = path.join(servPath, f.path);
    var relPath = path.join(servExtPath, path.basename(f.path));
    fs.copySync(fPath, relPath);
    var jsPath = path.relative(extPath, relPath);
    csJS.push(jsPath);
    if (f.web_accessible) {
      waJS.push(jsPath);
    }
  }
  
  return {s: true, cs: {matches: ext.matches, js: csJS, run_at: ext.run_at}, wa: waJS};
}


// Log and explicitly return null for easy one-lining later as return type of `log.error` is not guarenteed to be null/undefined
function lerr(...msgs) {
  log.error(...msgs);
  return null;
}

async function installDep(name, version) {
  // TODO: Check if dep is already installed, and error if version is different
  return new Promise(function(resolve, reject) {
    log.trace_(`Installing ${name}@${version}... `);
    var cmd = `npm install ${name}@${version}`;
    if (/^win/.test(process.platform)) {  // If windows, ...
      cmd = `${process.env.comspec} /c ${cmd}`;
    }
    exec(cmd, function(err) {
      if (err != null) {
        reject(err);
      } else {
        log.trace("Done");
        resolve();
      }
    });
  });
}

async function installDeps(mnfst) {
  log.info(`Installing dependencies for ${mnfst.name}...`);
  log._indent();
  for (let name in mnfst.dependencies) {
    let version = mnfst.dependencies[name];
    await installDep(name, version);
  }
  log._deindent();
}

function loadScript(name, mnfst, servPath) {
  if (path.isAbsolute(mnfst.scripts[name])) {
    return lerr(`Error parsing manifest for '${mnfst.name}': ${name} script path must be relative`);
  }
  try {
    let pth = require.resolve(path.relative(__dirname, path.join(servPath, mnfst.scripts[name])));
    let mod = require(pth);
    mnfst._reqPaths.push(pth);
    return mod;
  } catch (e) {
    return lerr(`Error loading ${name} script for module '${mnfst.name}':`, e);
  }
}

module.exports = {
  parse: async function(servicesPath, serviceFolder, extPath) {
    var servPath = path.join(servicesPath, serviceFolder);
    var manPath = path.join(servPath, "manifest.json");
    log.debug(` > Parsing manifest ${manPath}`);
    if (!fs.existsSync(manPath)) {
      return lerr(`Service '${serviceFolder}' is missing a manifest.json file.`);
    }
    
    var mnfst;
    try {
      mnfst = require(manPath);
    } catch (e) {
      return lerr(`Error loading manifest for service '${serviceFolder}':`, e);
    }
    
    if (mnfst == null) {
      return lerr(`Error loading manifest for service '${serviceFolder}': mnfst is null or undefined (This should never happen. If it does, please report it at https://github.com/thislooksfun/audio_queue and include the manifest.json used)`);
    }
    
    // Store for later use when uninstalling
    mnfst._reqPaths = [require.resolve(manPath)];
    
    if (!misc.verifyKeys(serviceFolder, mnfst, requiredKeys)) {
      return null;  // Error message was aleady printed
    }
    
    if (mnfst.dependencies != null) {
      await installDeps(mnfst);
    }
    
    let prep = loadScript("prep", mnfst, servPath);
    let play = loadScript("play", mnfst, servPath);
    let search = loadScript("search", mnfst, servPath);
    let getInfo = loadScript("info", mnfst, servPath);
    
    var ext;
    if (mnfst.extension != null) {
      var res = processExtensionInfo(mnfst.extension, servPath, mnfst.name, extPath);
      if (!res.s) {
        if (res.msgs != null) log.error(`Error loading extension info for module '${mnfst.name}':`, ...res.msgs);
        return null;
      }
      ext = {contentScripts: res.cs, webAccess: res.wa};
    }
    
    return {raw: mnfst, name: mnfst.name, prep: prep, play: play, search: search, getInfo: getInfo, extension: ext};
  }
};