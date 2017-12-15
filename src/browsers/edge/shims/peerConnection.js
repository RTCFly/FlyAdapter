const shimRTCPeerConnection = require("rtcpeerconnection-shim");
export default function PeerConnection(version) {

    if (window.RTCIceGatherer) {
        // ORTC defines an RTCIceCandidate object but no constructor.
        // Not implemented in Edge.
        if (!window.RTCIceCandidate) {
            window.RTCIceCandidate = function(args) {
                return args;
            };
        }
        // ORTC does not have a session description object but
        // other browsers (i.e. Chrome) that will support both PC and ORTC
        // in the future might have this defined already.
        if (!window.RTCSessionDescription) {
            window.RTCSessionDescription = function(args) {
                return args;
            };
        }
        // this adds an additional event listener to MediaStrackTrack that signals
        // when a tracks enabled property was changed. Workaround for a bug in
        // addStream, see below. No longer required in 15025+
        if (version < 15025) {
            var origMSTEnabled = Object.getOwnPropertyDescriptor(
                window.MediaStreamTrack.prototype, 'enabled');
            Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
                set: function(value) {
                    origMSTEnabled.set.call(this, value);
                    var ev = new Event('enabled');
                    ev.enabled = value;
                    this.dispatchEvent(ev);
                }
            });
        }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
        Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
            get: function() {
                if (this._dtmf === undefined) {
                    if (this.track.kind === 'audio') {
                        this._dtmf = new window.RTCDtmfSender(this);
                    }
                    else if (this.track.kind === 'video') {
                        this._dtmf = null;
                    }
                }
                return this._dtmf;
            }
        });
    }

    window.RTCPeerConnection =
        shimRTCPeerConnection(window, browserDetails.version);
}
