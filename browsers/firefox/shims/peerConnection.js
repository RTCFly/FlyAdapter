export default function(version) {
    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
            window.mozRTCPeerConnection)) {
        throw new Error("Could not find WebRTC API, probably media.peerconnection.enabled=false in about:config");
    }

    window.RTCPeerConnection;
    if (!window.RTCPeerConnection) {
        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
            if (version < 38) {
                pcConfig = ParseIceServersForSingleURL(pcConfig);
            }

            return window.mozRTCPeerConnection(pcConfig, pcConstraints);
        };
    }
    window.RTCPeerConnection.prototype =
        window.mozRTCPeerConnection.prototype;
    WrapStaticMethods();
    ShimSDP();
    ShimStats(version);
};

function ParseIceServersForSingleURL(pcConfig) {
    // .urls is not supported in FF < 38.
    // create RTCIceServers with a single url.
    if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                    var newServer = {
                        url: server.urls[j]
                    };
                    if (server.urls[j].indexOf('turn') === 0) {
                        newServer.username = server.username;
                        newServer.credential = server.credential;
                    }
                    newIceServers.push(newServer);
                }
            }
            else {
                newIceServers.push(pcConfig.iceServers[i]);
            }
        }
        pcConfig.iceServers = newIceServers;
    }
    return pcConfig;
}

function WrapStaticMethods() {
    if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
            get: function() {
                return window.mozRTCPeerConnection.generateCertificate;
            }
        });
    }
}

function ShimSDP() {
    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
    .forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
        };
    });
}

function SupportNullIceCandidate() {
    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
        if (!arguments[0]) {
            if (arguments[1]) {
                arguments[1].apply(null);
            }
            return Promise.resolve();
        }
        return nativeAddIceCandidate.apply(this, arguments);
    };
}

function ShimStats(browserVersion){
    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserVersion < 48) {
            stats = makeMapStats(stats);
          }
          if (browserVersion < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
}