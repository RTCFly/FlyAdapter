const { detectBrowser } = require('rtcdetector');

const chromeShim = require('browsers/chrome');
const firefoxShim = require('browsers/firefox');

export default function ShimFactory(API) {
    const browserInfo = detectBrowser();
    //This is not yet implemented, soon though!
    console.log("got browser info", browserInfo)
    switch (browserInfo.name) {
        case "Firefox":
            return firefoxShim(browserInfo.version, API);
        case "Chrome":
            return chromeShim(browserInfo.version, API);
        default:
            return API;
    }
};
