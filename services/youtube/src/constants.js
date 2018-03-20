"use strict";

const fs = require("fs");
const path = require("path");

const scriptsDir = path.join(__dirname, "../scripts");
const constants = {
  scripts: {
    prep:   fs.readFileSync(path.join(scriptsDir, "prep.js"),   "utf-8"),
    play:   fs.readFileSync(path.join(scriptsDir, "play.js"),   "utf-8"),
    status: fs.readFileSync(path.join(scriptsDir, "status.js"), "utf-8"),
  },
};

module.exports = constants;