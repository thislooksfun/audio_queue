"use strict";

// Global imports
const yt = require("youtube-api");
const qStr = require("querystring");

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
        throw new Error(err);
      }
      resolve(res);
    });
  });
}

module.exports = async function(query, maxResults = 10) {
  let res = await search(query, maxResults);
  
  var results = [];
  for (let i of res.items) {
    [{title: "oh my", id: "noclue", length: 1400000}];
    
    let obj = {
      title: i.snippet.title,
      id: i.id.videoId,
      length: -1,
    };
    results.push(obj);
  }
  
  return results;
};