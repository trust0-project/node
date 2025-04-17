import { circuitRelayServer, CircuitRelayService } from '@libp2p/circuit-relay-v2';
import { identify, Identify, IdentifyPush, identifyPush } from '@libp2p/identify';
import { ping, PingService } from '@libp2p/ping';
import { delegatedHTTPRoutingDefaults } from '@helia/routers'
import { KadDHT, kadDHT } from '@libp2p/kad-dht';
import { removePrivateAddressesMapper, removePublicAddressesMapper } from '@libp2p/kad-dht'
import { autoNAT } from '@libp2p/autonat'
import { dcutr } from '@libp2p/dcutr'
import { keychain, type Keychain } from '@libp2p/keychain'
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'

import { DELEGATED_ROUTING_V1_HOST } from '../config';
import { NodeType } from '../types';


export type NodeServices = {
    identify: Identify,
    ping: PingService, 
    lanDHT: KadDHT,
    aminoDHT: KadDHT,
    dcutr?: unknown,
    delegatedRouting?: unknown,
    identifyPush?: IdentifyPush,
    keychain?: Keychain,
    relay?: CircuitRelayService
};

export function getCommonServices() {
    return {
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        delegatedRouting: () => createDelegatedRoutingV1HttpApiClient(DELEGATED_ROUTING_V1_HOST, delegatedHTTPRoutingDefaults()),
        identify: identify(),
        identifyPush: identifyPush(),
        keychain: keychain(),
        ping: ping(),
        lanDHT: kadDHT({
            protocol: '/ipfs/lan/kad/1.0.0',
            peerInfoMapper: removePublicAddressesMapper,
            clientMode: false,
            logPrefix: 'libp2p:dht-lan',
            datastorePrefix: '/dht-lan',
            metricsPrefix: 'libp2p_dht_lan'
          }),
          aminoDHT: kadDHT({
            protocol: '/ipfs/kad/1.0.0',
            peerInfoMapper: removePrivateAddressesMapper,
            logPrefix: 'libp2p:dht-amino',
            datastorePrefix: '/dht-amino',
            metricsPrefix: 'libp2p_dht_amino'
          })
        
    }
}


export function getBrowserServices() {
    return getCommonServices()
}

export function getServerServices() {
    return {
        ...getCommonServices(),
        relay: circuitRelayServer({reservations:{maxReservations: 100}}),

    }}

export function getDefaultServices(type: NodeType) {
    if (type === 'relay' || type === 'server') {
        return getServerServices();
    }
    return getBrowserServices();
}