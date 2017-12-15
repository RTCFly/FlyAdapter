const { detectBrowser } = require('rtcdetector');

const chromeShim = require('./browsers/chrome');
const firefoxShim = require('./browsers/firefox');
const edgeShim = require('./browsers/edge');
const safariShim = require('./browsers/safari');

export default function ShimFactory(API) {
    const browserInfo = detectBrowser();
    //This is not yet implemented, soon though!
    console.log("got browser info", browserInfo)
    switch (browserInfo.name) {
        case "Firefox":
            return firefoxShim(browserInfo.version);
        case "Chrome":
            return chromeShim(browserInfo.version);
        case "Edge":
            return edgeShim(browserInfo.version);
        case "Safari":
            return safariShim(browserInfo.version);
        default:
            return API;
    }
};
