"use strict";

const cp = require("child_process");
const fs = require("fs");
const CB = require("circular-buffer");

var processes = [];
var valid = true;

var cpuData = (function() {
  const interval = 1; // The interval between captures, in seconds
  
  let u = (function() {
    var skip = 1; // Skip the first two header messages
    var line = '';
    var history = new CB(10*60 / interval); // Store the last 10 minutes of data
    
    var user_index = -1;
    var system_index = -1;
    var idle_index = -1;
    function process_line(l) {
      let parts = l.trim().split(" ").filter((a) => a.length > 0);
      if (parts.length == 0) { return; }
      if (skip > 0) {
        skip--;
        return;
      }
      
      if (Number.isNaN(parseFloat(parts[2]))) {
        for (var i = 1; i < parts.length; i++) {
          switch (parts[i]) {
            case "%user":
              user_index = i;
              break;
            case "%system":
              system_index = i;
              break;
            case "%idle":
              idle_index = i;
              break;
          }
        }
        return;
      }
      
      history.push({user: parts[user_index]/100, system: parts[system_index]/100, idle: parts[idle_index]/100})
    }
  
    let sar_u = cp.spawn("sar", ["-u", interval]);
    processes.push(sar_u);
    sar_u.stdout.on('data', (data) => {
      line += `${data}`;
      while (line.indexOf("\n") != -1) {
        let [l, ...tmp] = line.split("\n");
        process_line(l);
        line = tmp.join("\n");
      }
    });
  
    return function() {
      return history.toarray();
    }
  })();
  
  
  let p = (function() {
    var skip = 1; // Skip the first two header messages
    var line = '';
    var cores = [];  // Stores the 'immediate' value (avg over last second) of each core
  
    var cpu_index = -1;
    var idle_index = -1;
    function process_line(l) {
      let parts = l.trim().split(" ").filter((a) => a.length > 0);
      if (parts.length == 0) { return; }
      if (skip > 0) {
        skip--;
        return;
      }
  
      if (Number.isNaN(parseFloat(parts[2]))) {
        for (var i = 1; i < parts.length; i++) {
          switch (parts[i]) {
            case "CPU":
              cpu_index = i;
              break;
            case "%idle":
              idle_index = i;
              break;
          }
        }
        return;
      }
  
      if (parts[cpu_index] === "all") { return; }
      cores[parseInt(parts[cpu_index])] = 1-parseFloat(parts[idle_index])/100;
    }
  
    let sar_p = cp.spawn("sar", ["-P", "ALL", interval]);
    processes.push(sar_p);
    sar_p.stdout.on('data', (data) => {
      line += `${data}`;
      while (line.indexOf("\n") != -1) {
        let [l, ...tmp] = line.split("\n");
        process_line(l);
        line = tmp.join("\n");
      }
    });
  
    return function() {
      return cores
    }
  })();
  
  return function() {
    return {history: u(), cores: p()}
  }
})();



function splitTemp(c) {
  let f = (1.8 * c) + 32;
  return {c: c, f: f}
}

function gpuTemp() {
  let res = cp.execSync("vcgencmd measure_temp | cut -c 6- | rev | cut -c 3- | rev", {"encoding": "utf-8"}).trim();
  return splitTemp(parseFloat(res));
}

function cpuTemp() {
  let res = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp", "utf-8");
  return splitTemp(parseFloat(res)/1000);
}

function temp() {
  if (!valid) {
    throw new Error("Attempting to get sysinfo after invalidation.");
  }
  return {cpu: cpuTemp(), gpu: gpuTemp()}
}

function memUsage() {
    let res = cp.execSync("free -m | awk '{ if (/^Mem/) { print ($2 - $7) \" \" $2 } }'", {"encoding": "utf-8"}).trim();
    let [a, t] = res.split(" ");
    return {total: t, available: a, percentageUsed: a/t};
}

function wrap(fn) {
  if (!valid) {
    throw new Error("Attempting to get sysinfo after invalidation.");
  }
  return fn();
}

module.exports = {
  memoryUsage: wrap.bind(null, memUsage),
  temp:        wrap.bind(null, temp),
  cpuData:     wrap.bind(null, cpuData),
  
  stop: function() {
    for (let proc of processes) {
      proc.kill();
    }
    processes = [];
    valid = false;
  },
}