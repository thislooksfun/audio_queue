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
  error:   function(...args) { log("[ERROR]", ...args); },
  warning: function(...args) { log("[WARN] ", ...args); },
  info:    function(...args) { log("[INFO] ", ...args); },
  trace:   function(...args) { log("[TRACE]", ...args); },
  debug:   function(...args) { if (debugMode) log("[DEBUG] ", ...args); }
}