"use strict";

const log = pquire("helper/log");

// Set up the options
const optionDefinitions = [
  {
    name: "help", alias: "h", type: Boolean,
    description: "Display this usage guide.",
    group: "main"
  },
  {
    name: "log-level", type: String,
    description: "Set the log level.",
    group: "main"
  },
  {
    name: "debug", alias: "d", type: Boolean,
    typeLabel: "",
    description: "Enable debug mode. (Automatically sets --headed and sets --log-level to 'debug')",
    group: "debug"
  },
  {
    name: "headed", type: Boolean,
    typeLabel: "",
    description: "Run with a visible browser window.",
    group: "debug"
  },
];

// Set up the usage guide
const commandLineSections = [
  {
    header: "Main options",
    optionList: optionDefinitions,
    group: [ "main" ]
  },
  {
    header: "Debugging options",
    optionList: optionDefinitions,
    group: [ "debug" ]
  },
  {
    header: "Misc",
    optionList: optionDefinitions,
    group: "_none"
  }
];


// Get command line args"command-line-args"
const commandLineArgs = require("command-line-args");
const opts = commandLineArgs(optionDefinitions);

if (opts.main.help) {  // Display help and exit.
  const formatUsage = require("command-line-usage");
  console.log(formatUsage(commandLineSections));
  process.exit(0);
} else {  // Validate arguments
  let settings = pquire("settings");
  
  if (opts.debug.debug) {
    settings.debug = true;
    opts.main["log-level"] = "debug";
    opts.debug.headed = true;
  }
  
  // Set log level (does error checking itself);
  log._setLevel(opts.main["log-level"]);
  
  if (opts.debug.headed) {
    settings.headless = false;
  }
}