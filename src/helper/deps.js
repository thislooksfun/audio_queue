"use strict";

// Global imports
const fs   = require("fs-extra");
const path = require("path");
const {exec} = require("child_process");


// async function installDep(name, version) {
//   // TODO: Check if dep is already installed, and error if version is different
//   return new Promise(function(resolve, reject) {
//     log.trace_(`Installing ${name}@${version}... `);
//     var cmd = `npm install ${name}@${version}`;
//     if (/^win/.test(process.platform)) {  // If windows, ...
//       cmd = `${process.env.comspec} /c ${cmd}`;
//     }
//     exec(cmd, function(err) {
//       if (err != null) {
//         reject(err);
//       } else {
//         log.trace("Done");
//         resolve();
//       }
//     });
//   });
// }

async function install() {
  return new Promise(function(resolve, reject) {
    var cmd = "npm install";
    if (/^win/.test(process.platform)) {  // If windows, ...
      cmd = `${process.env.comspec} /c ${cmd}`;
    }
    exec(cmd, function(err) {
      if (err != null) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


// TODO: If none are missing, don't install
// TODO: If there are conflicts, throw error


module.exports = {
  async process(deps) {
    log.trace_(`Processing ${deps.length} dependencies... `);
    
    let rootDir = path.join(__dirname, "../../");
    let packagePath = rootDir + "package.json";
    let copyPath = rootDir + "package.copy";
    
    fs.copySync(packagePath, copyPath);
    var pkg = require(rootDir + "package.json");
    var pkgDeps = pkg.dependencies || {};
    for (let d of deps) {
      pkgDeps[d.name] = d.version;
    }
    pkg.dependencies = pkgDeps;
    fs.writeFileSync(packagePath, JSON.stringify(pkg));
    
    await install();
    
    fs.removeSync(packagePath);
    fs.moveSync(copyPath, packagePath);
    log.trace("Done");
  }
};