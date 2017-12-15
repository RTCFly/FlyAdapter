export default function(version) {
    if (window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
            get: function() {
                return this._ontrack;
            },
            set: function(f) {
                if (this._ontrack) {
                    this.removeEventListener('track', this._ontrack);
                    this.removeEventListener('addstream', this._ontrackpoly);
                }
                this.addEventListener('track', this._ontrack = f);
                this.addEventListener('addstream', this._ontrackpoly = function(e) {
                    e.stream.getTracks().forEach(function(track) {
                        var event = new Event('track');
                        event.track = track;
                        event.receiver = { track: track };
                        event.transceiver = { receiver: event.receiver };
                        event.streams = [e.stream];
                        this.dispatchEvent(event);
                    }.bind(this));
                }.bind(this));
            }
        });
    }
    if (window.RTCTrackEvent && ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
        Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
            get: function() {
                return { receiver: this.receiver };
            }
        });
    }
}
