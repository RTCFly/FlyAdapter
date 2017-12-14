export default function(version) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
        return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        console.log("removeStream is deprecated, use removeTrack");
        this.getSenders().forEach(function(sender) {
            if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
                pc.removeTrack(sender);
            }
        });
    };
}
