# Fly Adapter

Fly Adapter provides an easy way to work with modular, stable WebRTC.

#### What does it do? 
It simple wraps the WebRTC API and includes the latest version of [WebRTC Adapter](https://github.com/webrtc/adapter) on install. 

```
import { getUserMedia, RTCPeerConnection } from 'flyadapter';

```

Why? We found WebRTC to be hard to work with in injection style architectures and with TDD. 
This package makes it easy to fake out the WebRTC API, whilst quietly having the benfits of [WebRTC Adapter](https://github.com/webrtc/adapter).

#### What about TypeScript?
We have the `IFlyAdapter` interface.
```
interface IFlyAdapter {
    
  RTCPeerConnection();
  RTCDataChannel();
  RTCDataChannelEvent();
  RTCSessionDescription(); 
  RTCSessionDescriptionCallback();
  RTCStatsReport();
  RTCIceCandidate(); 
  RTCPeerConnectionIceEvent();
  RTCRtpSender(); 
  RTCRtpReceiver();
  RTCRtpContributingSource(); 
  RTCConfiguration();
  RTCSctpTransport();
  RTCIdentityAssertion();
  RTCIdentityEvent();
  RTCIdentityErrorEvent();
  RTCCertificate();
  getUserMedia();
  enumerateDevices();
}

```