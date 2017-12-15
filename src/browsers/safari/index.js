const localStreamsAPI = require('./shims/localStreamsAPI');
const remoteStreamsAPI = require('./shims/remoteStreamsAPI');
const callbacksAPI = require('./shims/callbacksAPI');
const getUserMedia = require('./shims/getUserMedia');
const rtcIceServersUrl = require('./shims/rtcIceServersUrl');
const trackEventTranceiver = require('./shims/trackEventTranceiver');
const createOfferLegacy = require('./shims/createOfferLegacy');
export default function (version){
    getUserMedia(version);
    localStreamsAPI(version);
    remoteStreamsAPI(version);
    callbacksAPI(version);
    rtcIceServersUrl(version);
    trackEventTranceiver(version);
    createOfferLegacy(version);
};