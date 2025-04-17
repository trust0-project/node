export const PROTOCOL = '/video-stream/1.0.0';
export const MIME_TYPE = 'video/webm;codecs=vp8';
export const MIME_CODEC = 'video/webm;codecs="vp8"';


export const MediaRecorderOptions = {
  mimeType: MIME_TYPE,
};

export const VIDEO_CONFIG: MediaStreamConstraints = {
  video: {
    width: { ideal: 800 },
    height: { ideal: 600 }
  }
};


export const DELEGATED_ROUTING_V1_HOST = process.env.DELEGATED_ROUTING_V1_HOST ||
  process.env.NEXT_PUBLIC_DELEGATED_ROUTING_V1_HOST ||
  'http://localhost:8081';

export const RELAY_MULTI_ADDR =       
  process.env.RELAY_MULTI_ADDR ||
  process.env.NEXT_PUBLIC_RELAY_MULTI_ADDR ||
  '/ip4/127.0.0.1/tcp/5050/ws'

export const TRUSTLESS_GATEWAY = process.env.TRUSTLESS_GATEWAY ||
  process.env.NEXT_PUBLIC_TRUSTLESS_GATEWAY ||
  'http://localhost:8080';

export const trustlessGateways = [
  TRUSTLESS_GATEWAY
]