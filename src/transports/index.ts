import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { webRTC, webRTCDirect } from '@libp2p/webrtc';
import { NodeType, WebSocketsOptions } from '../types';



export function getBrowserTransports(
  options: WebSocketsOptions = {}
) {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all, ...options }),
    ]
  }
  
  export function getNodeTransports(
    options: WebSocketsOptions = {}
  ) {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all, ...options }),
    ]
  }
  
  export function getRelayTransports(
    options: WebSocketsOptions = {}
  ) {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all, ...options }),
    ]
  }

  export function getDefaultTransports(type: NodeType, options: WebSocketsOptions = {}) {
    if (type === 'relay') {
      return getRelayTransports(options);
    }
    if (type === 'server') {
      return getNodeTransports(options);
    }
    return getBrowserTransports(options);
  } 