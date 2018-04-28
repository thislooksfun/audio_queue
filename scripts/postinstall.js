"use strict";

const fs       = require("fs-extra");
const tar      = require("tar-fs");
const bz2      = require("unbzip2-stream");
const path     = require("path");
const gunzip   = require("gunzip-maybe");
const request  = require("request");
const execSync = require("child_process").execSync;

const geckodriverVersion = "v0.20.1";
const geckoDriverURLPrefix = "https://github.com/mozilla/geckodriver/releases/download/" + geckodriverVersion + "/";

function download(url, filename) {
  return new Promise(function(resolve) {
    request(url).pipe(fs.createWriteStream(filename)).on("finish", resolve);
  });
}

function arch() {
  switch (process.arch) {
    case "x64": return 64;
    // case "arm": TODO
    default: {
      console.error(`ERROR: Unsupported architecture ${process.arch}. Please open an issue at https://github.com/thislooksfun/audio_queue`);
      // process.exit(1);
      return 32;
    }
  }
}

(async function() {
  try {
    // If the app already exists, don't bother.
    if (fs.existsSync("ffdev")) return;
    
    fs.mkdirpSync("tmp");
    var binPath;
    var geckoPlatform;
    
    switch (process.platform) {
      case "darwin": {
        /*
        ███    ███  █████   ██████  ██████  ███████
        ████  ████ ██   ██ ██      ██    ██ ██
        ██ ████ ██ ███████ ██      ██    ██ ███████
        ██  ██  ██ ██   ██ ██      ██    ██      ██
        ██      ██ ██   ██  ██████  ██████  ███████
        */
        
        geckoPlatform = "macos";
        
        
        // Install Firefox Developer Edition
        console.log("Downloading Firefox Developer Edition...");
        await download("https://download.mozilla.org/?product=firefox-devedition-latest-ssl&os=osx&lang=en-US", "tmp/ffdev.dmg");
        console.log("Mounting disk image...");
        let res = execSync("hdiutil mount tmp/ffdev.dmg").toString();
        let vol = res.match(/(\/Volumes\/.+)\n/)[1];
        console.log("Copying...");
        fs.mkdirSync("ffdev");
        fs.copySync(path.join(vol, "Firefox Developer Edition.app"), "ffdev/ffdev.app");
        binPath = path.join(process.cwd(), "ffdev/ffdev.app/Contents/MacOS/firefox-bin");
        console.log("Unmounting...");
        execSync(`hdiutil unmount "${vol}"`);
        break;
      }
      // case "win32": {
      //  /*
      //  ██     ██ ██ ███    ██ ██████   ██████  ██     ██ ███████
      //  ██     ██ ██ ████   ██ ██   ██ ██    ██ ██     ██ ██
      //  ██  █  ██ ██ ██ ██  ██ ██   ██ ██    ██ ██  █  ██ ███████
      //  ██ ███ ██ ██ ██  ██ ██ ██   ██ ██    ██ ██ ███ ██      ██
      //   ███ ███  ██ ██   ████ ██████   ██████   ███ ███  ███████
      //  */
      //
      //   geckoPlatform = "win" + arch();
      //
      //
      //   break;
      // }
      case "linux": {
        /*
        ██      ██ ███    ██ ██    ██ ██   ██
        ██      ██ ████   ██ ██    ██  ██ ██
        ██      ██ ██ ██  ██ ██    ██   ███
        ██      ██ ██  ██ ██ ██    ██  ██ ██
        ███████ ██ ██   ████  ██████  ██   ██
        */
        
        geckoPlatform = "linux" + arch();
        
        
        // Install Firefox Developer Edition
        console.log("Downloading Firefox Developer Edition...");
        
        await download("https://download.mozilla.org/?product=firefox-devedition-latest-ssl&os=" + geckoPlatform + "&lang=en-US", "tmp/ffdev.tar.bz2");
        console.log("Decompressing...");
        fs.createReadStream("tmp/ffdev.tar.bz2").pipe(bz2()).pipe(tar.extract("./ffdev"));
        binPath = path.join(process.cwd(), "ffdev/firefox-bin");
        break;
      }
      default: {
        console.error(`ERROR: Unsupported platform ${process.platform}. Please open an issue at https://github.com/thislooksfun/audio_queue`);
        process.exit(1);
      }
    }
    
    
    // Install geckodriver
    console.log("Downloading geckodriver...");
    let geckoZip = "geckodriver-" + geckodriverVersion + "-" + geckoPlatform + ".tar.gz";
    await download(geckoDriverURLPrefix + geckoZip, "tmp/geckodriver.tar.gz");
    console.log("Decompressing...");
    fs.createReadStream("tmp/geckodriver.tar.gz").pipe(gunzip()).pipe(tar.extract("./bin"));
    
    
    // Clean up
    console.log("Cleaning up...");
    fs.remove("tmp");
    
    
    console.log("Writing ff_bin_path.txt...");
    fs.writeFileSync("ff_bin_path.txt", binPath);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();