import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { webRTC, webRTCDirect } from '@libp2p/webrtc';
import { NodeType } from '../types';

export function getBrowserTransports() {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all }),
    ]
  }
  
  export function getNodeTransports() {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all }),
    ]
  }
  
  export function getRelayTransports() {
    return [
      circuitRelayTransport(),
      webRTC(),
      webRTCDirect(),
      webSockets({ filter: filters.all }),
    ]
  }



  export function getDefaultTransports(type: NodeType) {
    if (type === 'relay') {
      return getRelayTransports();
    }
    if (type === 'server') {
      return getNodeTransports();
    }
    return getBrowserTransports();
  } 