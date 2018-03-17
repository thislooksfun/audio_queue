const fs   = require('fs');
const path = require('path');
const log  = require('./log');

const requiredKeys = {
  name: 'string',
  title: 'string',
  author: 'string',
  home: 'string',
  share: 'string',
  icon: 'string',
  scripts: {
    prep: 'string',
    play: 'string'
  }
}

function verifyKeys(sName, mnfst) {
  var keysToVerify = [{path: '_', obj: requiredKeys}];
  while (keysToVerify.length > 0) {
    var pair = keysToVerify.shift();
    for (var name in pair.obj) {
      var prop = pair.obj[name];
      var key = pair.path + '.' + name;
      var type = typeof prop;
      if (type === 'string') {
        var res = verifyKey(mnfst, key, prop);
        if (!res.s) {
          if (res.type === 'missing') {
            log.error(`Error parsing manifest for service ${sName}: Key ${key.substring(2)} not found`);
            return false;
          } else if (res.type === 'mismatch') {
            log.error(`Error parsing manifest for service ${sName}: Type mismatch for key ${key.substring(2)} ; expected ${res.expected}, got ${res.got}`);
            return false;
          }
        }
      } else if (type === 'object') {
        keysToVerify.push({path: key, obj: prop});
      } else {
        log.error(`Error reading requiredKeys dict, key ${key} is of type ${type}`);
        return false;
      }
    }
  }
  
  return true;
}

function verifyKey(mnfst, key, val) {
  var pathParts = key.split('.');
  pathParts.shift(); //always starts with one (_) that we can ignore.
  var obj = mnfst;
  for (p of pathParts) {
    obj = obj[p];
    if (obj == null) {
      return {s: false, type: 'missing'};
    }
  }
  if (typeof obj !== val) {
    return {s: false, type: 'mismatch', expected: val, got: typeof obj};
  }
  
  return {s: true};
}


module.exports = {
  parse: function(servicesPath, serviceFolder) {
    var servPath = path.join(servicesPath, serviceFolder);
    var manPath = path.join(servPath, 'manifest.json');
    if (!fs.existsSync(manPath)) {
      log.error(`Service '${serviceFolder}' is missing a manifest.json file.`);
      log.debug(` > Attempting to open file ${manPath}`);
      return null;
    }

    
    var mnfst;
    try {
      mnfst = require(manPath);
    } catch (e) {
      log.error(`Error parsing manifest for '${serviceFolder}':`, e);
      return null;
    }
    
    if (!verifyKeys(serviceFolder, mnfst)) {
      return null;
    }
    
    if (path.isAbsolute(mnfst.scripts.prep)) {
      log.error(`Error parsing manifest for '${serviceFolder}': Prep script path must be relative`);
      return null;
    }
    
    if (path.isAbsolute(mnfst.scripts.play)) {
      log.error(`Error parsing manifest for '${serviceFolder}': Play script path must be relative`);
      return null;
    }
    
    var prep;
    try {
      console.log('a:', path.relative(__dirname, path.join(servPath, mnfst.scripts.prep)));
      prep = require(path.relative(__dirname, path.join(servPath, mnfst.scripts.prep)));
    } catch (e) {
      log.error(`Error loading prep script for module '${serviceFolder}':`, e);
      return null;
    }
    
    var play;
    try {
      play = require(path.relative(__dirname, path.join(servPath, mnfst.scripts.play)));
    } catch (e) {
      log.error(`Error loading play script for module '${serviceFolder}':`, e);
      return null;
    }
    
    return {raw: mnfst, name: mnfst.name, prep: prep, play: play};
  }
}