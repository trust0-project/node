import { WebSocketsInit } from '@libp2p/websockets';

export type NodeType = 'browser' | 'relay' | 'server';
export type Addresses = {
  listen: string[],
  announce?: string[]
}

export type WebSocketsOptions = {
  ws?: WebSocketsInit['websocket'],
  server?: WebSocketsInit['http'] | WebSocketsInit['https']
}