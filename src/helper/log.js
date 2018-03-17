const util = require('util');

var debugMode = process.argv.length >= 3 && process.argv[2] === '-d';

function log(prefix, ...messages) {
  var msgs = [];
  for (m of messages) {
    var msg = '';
    switch (typeof m) {
      case "string":
        msg = m;
        break;
      case "number":
      case "boolean":
        msg = ""+m;
        break;
      default:
        msg = util.inspect(m, {showHidden: true, depth: null});
        break;
    }
    msgs.push(msg.replace(/\n/g, '\n    >>> '));
  }
  console.log(prefix, ...msgs);
}

module.exports = {
  fatal(...args) { log("[FATAL]", ...args); process.exit(1); },
  error(...args) { log("[ERROR]", ...args); },
   warn(...args) { log("[WARN] ", ...args); },
   info(...args) { log("[INFO] ", ...args); },
  trace(...args) { log("[TRACE]", ...args); },
  debug(...args) { if (debugMode) log("[DEBUG]", ...args); }
}