export default function LocalStreamsAPI (version) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
        return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.getLocalStreams = function() {
            if (!this._localStreams) {
                this._localStreams = [];
            }
            return this._localStreams;
        };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.getStreamById = function(id) {
            var result = null;
            if (this._localStreams) {
                this._localStreams.forEach(function(stream) {
                    if (stream.id === id) {
                        result = stream;
                    }
                });
            }
            if (this._remoteStreams) {
                this._remoteStreams.forEach(function(stream) {
                    if (stream.id === id) {
                        result = stream;
                    }
                });
            }
            return result;
        };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
        const _addTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addStream = function(stream) {
            if (!this._localStreams) {
                this._localStreams = [];
            }
            if (this._localStreams.indexOf(stream) === -1) {
                this._localStreams.push(stream);
            }
            const self = this;
            stream.getTracks().forEach(function(track) {
                _addTrack.call(self, track, stream);
            });
        };

        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
            if (stream) {
                if (!this._localStreams) {
                    this._localStreams = [stream];
                }
                else if (this._localStreams.indexOf(stream) === -1) {
                    this._localStreams.push(stream);
                }
            }
            return _addTrack.call(this, track, stream);
        };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
        window.RTCPeerConnection.prototype.removeStream = function(stream) {
            if (!this._localStreams) {
                this._localStreams = [];
            }
            const index = this._localStreams.indexOf(stream);
            if (index === -1) {
                return;
            }
            this._localStreams.splice(index, 1);
            var self = this;
            var tracks = stream.getTracks();
            this.getSenders().forEach(function(sender) {
                if (tracks.indexOf(sender.track) !== -1) {
                    self.removeTrack(sender);
                }
            });
        };
    }
};
