"use strict";

const cp = require("child_process");

function memoryUsage() {
  let res = cp.execSync("free -m | awk '{ if (/^Mem/) { print \" ($2 - $7) \"/\" $2 \" (\" ($2 - $7)/$2 \"%)\" } }'");
  console.log(res);
  
  return {total: t, available: a, percentageUsed: p};
}

memoryUsage();