const { detectBrowser } = require('rtcdetector');

const browserInfo = detectBrowser();
//This is not yet implemented, soon though!
console.log("got browser info", browserInfo)
module.exports = {
  RTCPeerConnection:window.RTCPeerConnection,
  RTCDataChannel:window.RTCDataChannel, 
  RTCDataChannelEvent:window.RTCDataChannelEvent,
  RTCSessionDescription:window.RTCSessionDescription, 
  RTCSessionDescriptionCallback:window.RTCSessionDescriptionCallback,
  RTCStatsReport:window.RTCStatsReport, 
  RTCIceCandidate:window.RTCIceCandidate, 
  RTCPeerConnectionIceEvent:window.RTCPeerConnectionIceEvent,
  RTCRtpSender:window.RTCRtpSender, 
  RTCRtpReceiver:window.RTCRtpReceiver,
  RTCRtpContributingSource:window.RTCRtpContributingSource, 
  RTCConfiguration:window.RTCConfiguration,
  RTCSctpTransport:window.RTCSctpTransport,
  RTCIdentityAssertion:window.RTCIdentityAssertion,
  RTCIdentityEvent:window.RTCIdentityEvent,
  RTCIdentityErrorEvent:window.RTCIdentityErrorEvent,
  RTCCertificate:window.RTCCertificate,
  getUserMedia:window.navigator.mediaDevices.getUserMedia
  
  
}; 