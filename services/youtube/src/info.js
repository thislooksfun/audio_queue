"use strict";

// Global imports
const yt = require("youtube-api");
const iso  = require("iso8601-duration");

yt.authenticate({type:"key", key: require("../private/key.json").key});

async function getInfo(id) {
  return new Promise(function(resolve) {
    yt.videos.list({
      part: "snippet,contentDetails",
      id: id,
    }, function(err, res) {
      if (err != null) {
        console.log(err, res);
        throw new Error(err);
      }
      resolve(res.items[0]);
    });
  });
}

function getBestThumbnailURL(tbs) {
  if (tbs.maxres != null) return tbs.maxres.url;
  if (tbs.standard != null) return tbs.standard.url;
  if (tbs.high != null) return tbs.high.url;
  if (tbs.medium != null) return tbs.medium.url;
  if (tbs.default != null) return tbs.default.url;
  // Replace with 'missing image' url?
  return null;
}

module.exports = async function(id) {
  let i = await getInfo(id);
  let duration = iso.toSeconds(iso.parse(i.contentDetails.duration));
  let obj = {
    title: i.snippet.title,
    author: i.snippet.channelTitle,
    id: id,
    duration: duration,
    artworkURL: getBestThumbnailURL(i.snippet.thumbnails),
  };
  return obj;
};