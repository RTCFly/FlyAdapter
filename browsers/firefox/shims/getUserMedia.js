export default function(version) {
    function GetUserMedia(constraints, onSuccess, onError) {
        //Take a copy of constraints
        constraints = JSON.parse(JSON.stringify(constraints));
        if (version < 38) {
            if (constraints.audio) {
                constraints.audio = ConstraintsToFF37(constraints.audio);
            }
            if (constraints.video) {
                constraints.video = ConstraintsToFF37(constraints.video);
            }
        }
        return window.navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
            onError(ShimError(e));
        });
    };
    // Returns the result of getUserMedia as a Promise.
    function GetUserMediaPromise(constraints) {
        return new Promise(function(resolve, reject) {
            GetUserMedia(constraints, resolve, reject);
        });
    };
    function ShimMediaDevices() {
        // Shim for mediaDevices on older versions.
        if (!window.navigator.mediaDevices) {
            window.navigator.mediaDevices = {
                getUserMedia: GetUserMediaPromise(),
                addEventListener: function() {},
                removeEventListener: function() {}
            };
        }
        window.navigator.mediaDevices.enumerateDevices =
            window.navigator.mediaDevices.enumerateDevices || function() {
                return new Promise(function(resolve) {
                    var infos = [
                        { kind: 'audioinput', deviceId: 'default', label: '', groupId: '' },
                        { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }
                    ];
                    resolve(infos);
                });
            };

        if (version < 41) {
            // Work around http://bugzil.la/1169665
            var orgEnumerateDevices =
                window.navigator.mediaDevices.enumerateDevices.bind(window.navigator.mediaDevices);
            window.navigator.mediaDevices.enumerateDevices = function() {
                return orgEnumerateDevices().then(undefined, function(e) {
                    if (e.name === 'NotFoundError') {
                        return [];
                    }
                    throw e;
                });
            };
        }

        if (version < 49) {
            var origGetUserMedia = window.navigator.mediaDevices.getUserMedia.bind(window.navigator.mediaDevices);
            window.navigator.mediaDevices.getUserMedia = function(c) {
                return origGetUserMedia(c).then(function(stream) {
                    // Work around https://bugzil.la/802326
                    if (c.audio && !stream.getAudioTracks().length ||
                        c.video && !stream.getVideoTracks().length) {
                        stream.getTracks().forEach(function(track) {
                            track.stop();
                        });
                        throw new DOMException('The object can not be found here.',
                            'NotFoundError');
                    }
                    return stream;
                }, function(e) {
                    return Promise.reject(ShimError(e));
                });
            };
        }




        if (!(version > 55 &&
                'autoGainControl' in window.navigator.mediaDevices.getSupportedConstraints())) {
            var remap = function(obj, a, b) {
                if (a in obj && !(b in obj)) {
                    obj[b] = obj[a];
                    delete obj[a];
                }
            };

            var nativeGetUserMedia = window.navigator.mediaDevices.getUserMedia.
            bind(window.navigator.mediaDevices);
            window.navigator.mediaDevices.getUserMedia = function(c) {
                if (typeof c === 'object' && typeof c.audio === 'object') {
                    c = JSON.parse(JSON.stringify(c));
                    remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
                    remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
                }
                return nativeGetUserMedia(c);
            };

            if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
                const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
                MediaStreamTrack.prototype.getSettings = function() {
                    var obj = nativeGetSettings.apply(this, arguments);
                    remap(obj, 'mozAutoGainControl', 'autoGainControl');
                    remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
                    return obj;
                };
            }

            if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
                const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
                MediaStreamTrack.prototype.applyConstraints = function(c) {
                    if (this.kind === 'audio' && typeof c === 'object') {
                        c = JSON.parse(JSON.stringify(c));
                        remap(c, 'autoGainControl', 'mozAutoGainControl');
                        remap(c, 'noiseSuppression', 'mozNoiseSuppression');
                    }
                    return nativeApplyConstraints.apply(this, [c]);
                };
            }
        }


    }

    function ConstraintsToFF37(constraint) {
        if (typeof constraint !== 'object' || constraint.require) {
            return constraint;
        }
        const require = [];
        for (let key in constraint) {
            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                continue;
            }
            const requirement = constraint[key] = (typeof constraint[key] === 'object') ?
                constraint[key] : { ideal: constraint[key] };

            if (requirement.min !== undefined || requirement.max !== undefined || requirement.exact !== undefined) {
                require.push(key);
            }
            if (requirement.exact !== undefined) {
                if (typeof requirement.exact === 'number') {
                    requirement.min = requirement.max = requirement.exact;
                }
                else {
                    constraint[key] = requirement.exact;
                }
                requirement.exact = undefined;
            }
            if (requirement.ideal !== undefined) {
                constraint.advanced = constraint.advanced || [];
                var oc = {};
                if (typeof requirement.ideal === 'number') {
                    oc[key] = { min: requirement.ideal, max: requirement.ideal };
                }
                else {
                    oc[key] = requirement.ideal;
                }
                constraint.advanced.push(oc);
                requirement.ideal = undefined;
                if (!Object.keys(requirement).length) {
                    constraint[key] = undefined;
                }
            }

        }

        if (require.length) {
            constraint.require = require;
        }
        return constraint;
    }

    function ShimError(e) {
        return {
            name: {
                InternalError: 'NotReadableError',
                NotSupportedError: 'TypeError',
                PermissionDeniedError: 'NotAllowedError',
                SecurityError: 'NotAllowedError'
            }[e.name] || e.name,
            message: {
                'The operation is insecure.': 'The request is not allowed by the ' +
                    'user agent or the platform in the current context.'
            }[e.message] || e.message,
            constraint: e.constraint,
            toString: function() {
                return this.name + (this.message && ': ') + this.message;
            }
        };
    };
    ShimMediaDevices();
    window.navigator.getUserMedia = function(constraints, onSuccess, onError) {
        if (version < 44) {
            return GetUserMedia(constraints, onSuccess, onError);
        }
        console.log("Deprecated, please user navigator.mediaDevices.getUserMedia");
        window.navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    };

}
