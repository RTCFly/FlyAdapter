export default function GetUserMedia() {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
        if (navigator.webkitGetUserMedia) {
            navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
        }
        else if (navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia) {
            navigator.getUserMedia = function(constraints, cb, errcb) {
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(cb, errcb);
            }.bind(navigator);
        }
    }
}
