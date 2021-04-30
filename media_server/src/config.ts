import {
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogTag,
} from "mediasoup/lib/types";

export const config = {
  // http server ip, port, and peer timeout constant
  //
  httpIp: "0.0.0.0",
  httpPort: 3001,
  httpPeerStale: 360000,

  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: "debug",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ] as WorkerLogTag[],
    },
    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
					kind       : 'video',
					mimeType   : 'video/VP8',
					clockRate  : 90000,
					parameters :
					{
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP9',
					clockRate  : 90000,
					parameters :
					{
						'profile-id'             : 2,
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '4d0032',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '42e01f',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				}
      ] as RtpCodecCapability[],
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.WEBRTC_LISTEN_IP || "192.168.1.165",
          announcedIp: process.env.A_IP || undefined,
        },
        // { ip: "192.168.42.68", announcedIp: null },
        // { ip: '10.10.23.101', announcedIp: null },
      ] as TransportListenIp[],
      initialAvailableOutgoingBitrate: 800000,
			minimumAvailableOutgoingBitrate : 600000,
			maxSctpMessageSize              : 262144,
			// Additional options that are not part of WebRtcTransportOptions.
			maxIncomingBitrate              : 1500000
    },
  },
} as const;
