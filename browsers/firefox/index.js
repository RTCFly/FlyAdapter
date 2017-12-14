const ontrack = require('./shims/ontrack');
const sourceObject = require('./shims/sourceObject');
const peerConnection = require('./shims/peerConnection');
const removeStream = require('./shims/removeStream');
export default function FirefoxShim (version, API) {
    peerConnection(version, API);
    ontrack(version, API);
    sourceObject(version, API);
    removeStream(version, API);
}