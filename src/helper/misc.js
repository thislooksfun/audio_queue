"use strict";

// Global imports
const path = require("path");
// Local imports
const log = require("./log");

module.exports = {
  projectRoot: path.join(__dirname, "../../"),
  
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  verifyKeys: function(sName, forObj, requiredKeys, keyPrefix) {
    keyPrefix = keyPrefix || "";
    var keysToVerify = [{path: "_", obj: requiredKeys}];
    while (keysToVerify.length > 0) {
      var pair = keysToVerify.shift();
      for (var name in pair.obj) {
        var val = pair.obj[name];
        var key = pair.path + "." + name;
        var type = typeof val;
        if (type === "string") {
          var res = this.verifyKeyType(forObj, key, val);
          if (!res.s) {
            if (res.type === "missing") {
              log.error(`Error parsing manifest for service '${sName}': Key '${keyPrefix + key.substring(2)}' not found`);
              return false;
            } else if (res.type === "mismatch") {
              log.error(`Error parsing manifest for service '${sName}': Type mismatch for key '${keyPrefix + key.substring(2)}' ; expected ${res.expected}, got ${res.got}`);
              return false;
            }
          }
        } else if (type === "object") {
          keysToVerify.push({path: key, obj: val});
        } else {
          log.error(`Error reading requiredKeys dict, key '${keyPrefix + key}' is of type ${type}`);
          return false;
        }
      }
    }
    
    return true;
  },


  verifyKeyType: function(forObj, key, type) {
    var pathParts = key.split(".");
    pathParts.shift(); // always starts with one (_) that we can ignore.
    var obj = forObj;
    for (var p of pathParts) {
      obj = obj[p];
      if (obj == null) {
        return {s: false, type: "missing"};
      }
    }
    if (/\[.+\]/.test(type)) {
      var innerType = type.substring(1, type.length - 1);
      if (typeof obj !== "object" || !Array.isArray(obj)) {
        return {s: false, type: "mismatch", expected: `array of ${innerType}s`, got: typeof obj};
      }
      if (obj.length === 0) {
        return {s: true};  // If the array is empty, it's going to match any type of array.
      }
      
      var arrType = null;
      for (var i of obj) {
        var itype = typeof i;
        if (arrType != null && itype !== arrType) {
          return {s: false, type: "mismatch", expected: `array of ${innerType}s`, got: "mixed-type array"};
        }
        arrType = itype;
      }
      if (arrType !== innerType) {
        return {s: false, type: "mismatch", expected: `array of ${innerType}s`, got: `array of ${arrType}s`};
      }
    } else {
      if (typeof obj !== type) {
        return {s: false, type: "mismatch", expected: type, got: typeof obj};
      }
    }
    
    return {s: true};
  }
};