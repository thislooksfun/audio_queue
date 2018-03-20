"use strict";

var tlf = 15126;  // t=15, l=12, f=6, => tlf=15126
var audio_queue = 'Audio Queue'.split('').map((c) => c.charCodeAt(0)).reduce((l,c) => l+c);
var port = tlf + audio_queue

module.exports = {
  port: port,
  version: '1.0.0',
  bonjour: {
    name: 'TLF Audio Queue',
    type: 'tlf-music-queue'
  }
}