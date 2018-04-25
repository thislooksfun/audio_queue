"use strict";

const {exec} = require("child_process");

// const npmi = require("npmi");

async function installDep(name, version) {
  return new Promise(function(resolve, reject) {
    console.log(`Installing ${name}@${version}`);
    exec(`npm install ${name}@${version}`, function(err) {
      (err != null) ? reject(err) : resolve();
    });
  });
}

(async function main() {
  await installDep("iso8601-duration", "^1.1.1");
  console.log("Done");
})();

// Prevent exit on script end, to simulate webserver (express) running
setInterval(function() {}, 1000);