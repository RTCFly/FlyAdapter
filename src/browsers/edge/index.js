const replaceTrack = require("./shims/replaceTrack");
const peerConnection = require('./shims/peerConnection');
const getUserMedia = require('./shims/getUserMedia');
export default function(version){
    replaceTrack(version); 
    peerConnection(version);
    getUserMedia(version);
}