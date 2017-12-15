const ontrack = require('./shims/ontrack');
const sourceObject = require('./shims/sourceObject');
const peerConnection = require('./shims/peerConnection');
const removeStream = require('./shims/removeStream');
export default function FirefoxShim (version) {
    peerConnection(version);
    ontrack(version);
    sourceObject(version);
    removeStream(version);
}