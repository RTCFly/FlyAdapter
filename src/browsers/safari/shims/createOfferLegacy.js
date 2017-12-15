export default function CreateOfferLegacy() {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
        var pc = this;
        if (offerOptions) {
            var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
                return transceiver.sender.track &&
                    transceiver.sender.track.kind === 'audio';
            });
            if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
                if (audioTransceiver.direction === 'sendrecv') {
                    audioTransceiver.setDirection('sendonly');
                }
                else if (audioTransceiver.direction === 'recvonly') {
                    audioTransceiver.setDirection('inactive');
                }
            }
            else if (offerOptions.offerToReceiveAudio === true &&
                !audioTransceiver) {
                pc.addTransceiver('audio');
            }

            var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
                return transceiver.sender.track &&
                    transceiver.sender.track.kind === 'video';
            });
            if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
                if (videoTransceiver.direction === 'sendrecv') {
                    videoTransceiver.setDirection('sendonly');
                }
                else if (videoTransceiver.direction === 'recvonly') {
                    videoTransceiver.setDirection('inactive');
                }
            }
            else if (offerOptions.offerToReceiveVideo === true &&
                !videoTransceiver) {
                pc.addTransceiver('video');
            }
        }
        return origCreateOffer.apply(pc, arguments);
    };
}
