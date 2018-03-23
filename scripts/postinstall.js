"use strict";

const fs       = require("fs-extra");
const path     = require("path");
const request  = require("request");
const execSync = require("child_process").execSync;

function download(url, filename) {
  return new Promise(function(resolve) {
    request(url).pipe(fs.createWriteStream(filename)).on("finish", resolve);
  });
}

(async function() {
  try {
    fs.mkdirpSync("tmp");
    
    var binPath;
    
    // If the app already exists, don't bother.
    if (fs.existsSync("ffdev")) return;
    
    switch (process.platform) {
      case "darwin": {
        // macOS
        
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
      //   // Windows
      //   break;
      // }
      // case "linux": {
      //   // linux
      //   break;
      // }
      default:
        console.error(`ERROR: Unsupported platform ${process.platform}. Please open an issue at https://github.com/thislooksfun/audio_queue`);
        process.exit(1);
    }
    
    console.log("Cleaning up...");
    fs.remove("tmp");
    
    console.log("Writing ff_bin_path.txt...");
    fs.writeFileSync("ff_bin_path.txt", binPath);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();