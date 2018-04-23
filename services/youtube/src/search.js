"use strict";

// Global imports
const yt = require("youtube-api");
const qStr = require("querystring");
// Local imports
const info = require("./info");

yt.authenticate({type:"key", key: require("../private/key.json").key});

async function search(query, maxResults) {
  return new Promise(function(resolve) {
    yt.search.list({
      part: "snippet",
      maxResults: maxResults,
      q: qStr.escape(query).replace(/%20/g, "+"),
      type: "video",
      order: "relevance"
    }, function(err, res) {
      if (err != null) {
        console.log(err, res);
        throw new Error(err);
      }
      resolve(res);
    });
  });
}


module.exports = async function(query, maxResults = 10) {
  let {items} = await search(query, maxResults);
  
  let infoPromises = [];
  for (let i of items) {
    infoPromises.push(info(i.id.videoId));
  }
  return await Promise.all(infoPromises);
};