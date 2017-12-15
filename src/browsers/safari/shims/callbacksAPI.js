export default function CallbacksAPI() {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
        return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
        var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
        var promise = createOffer.apply(this, [options]);
        if (!failureCallback) {
            return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
        var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
        var promise = createAnswer.apply(this, [options]);
        if (!failureCallback) {
            return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
        var promise = setLocalDescription.apply(this, [description]);
        if (!failureCallback) {
            return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
        var promise = setRemoteDescription.apply(this, [description]);
        if (!failureCallback) {
            return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
        var promise = addIceCandidate.apply(this, [candidate]);
        if (!failureCallback) {
            return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
}
