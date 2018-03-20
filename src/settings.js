"use strict";

function str_to_num(s) {
  var chars = s.split("");
  var codes = chars.map((c) => c.charCodeAt(0));
  return codes.reduce((l, c) => l + c);
}

var tlf = 15126;  // t=15, l=12, f=6, => tlf=15126
var audio_queue = str_to_num("Audio Queue");
var port = tlf + audio_queue;

module.exports = {
  port: port,
  version: "1.0.0",
  bonjour: {
    name: "TLF Audio Queue",
    type: "tlf-music-queue"
  }
};