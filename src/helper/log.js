"use strict";

// Global imports
const util = require("util");


// Levels will be treated in decreasing order of severity (left is more severe, right is less severe)
const levels = ["error", "warn", "info", "trace", "debug"];
// The default level (Must be one of the above)
const defaultLvl = "info";


// The current log level (Can never be set < -1, i.e., it will always print FATAL messages)
var logLevel = -1;
function _log(level, prefix, ...messages) {
  // Only log if the level is <= the log level
  if (level > logLevel) return;
  
  var msgs = [];
  for (var m of messages) {
    var msg = "";
    switch (typeof m) {
    case "string":
      msg = m;
      break;
    case "number":
    case "boolean":
      msg = "" + m;
      break;
    default:
      msg = util.inspect(m, {showHidden: true, depth: null});
      break;
    }
    msgs.push(msg.replace(/\n/g, "\n    >>> "));
  }
  console.log(prefix, ...msgs);
}


// Hard-code fatal error, since it needs the "process.exit"
var log = { fatal(...args) { _log.call(null, -1, "[FATAL]", ...args); process.exit(1); } };

// Find longest prefix
var longest = 5; // "FATAL".length, since FATAL is hard-coded
for (var lvl of levels) { if (lvl.length > longest) longest = lvl.length; }

// Generate log functions
for (var i = 0; i < levels.length; i++) {
  // Force it to lowercase, just in case;
  let lvl = levels[i] = levels[i].toLowerCase();
  // Pad it out so all messages are the same distance, regardless of prefix
  let padding = " ".repeat(longest - lvl.length);
  // Add the log (bind the 'this' value to null, the 'level' to be i, and the 'prefix' to be the padded prefix)
  log[lvl] = _log.bind(null, i, `[${lvl.toUpperCase()}]${padding}`);
}

// Set the log level
log._setLevel = function(lvl) {
  if (lvl === undefined) return;
  
  var index = levels.indexOf(lvl.toLowerCase());
  if (lvl !== "silent" && index === -1) {
    log.fatal(`Unknown log level '${lvl}'\nValid log levels are:\n  ${levels.join(", ")}`);
  }
  // Index will be -1 if lvl === "silent"
  logLevel = index;
  log.trace(`Set log level to '${lvl}'`);
};

// Set default level
log._setLevel(defaultLvl);

// Export!
module.exports = log;