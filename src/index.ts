import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux';
import { createLibp2p, Libp2p } from 'libp2p';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { createHelia as createHeliaNode } from 'helia';
import { strings } from '@helia/strings';
import { privateKeyFromRaw } from '@libp2p/crypto/keys';
import { trustlessGateway,  bitswap, } from '@helia/block-brokers'
import { delegatedHTTPRouting, httpGatewayRouting, libp2pRouting } from '@helia/routers'
import { bootstrap as libp2pBootstrap} from '@libp2p/bootstrap'
import { Addresses, NodeType } from './types';

import { getDefaultServices, NodeServices } from './services';
import { getDefaultTransports } from './transports';
import { DELEGATED_ROUTING_V1_HOST, RELAY_MULTI_ADDR, trustlessGateways } from './config';
import { multiaddr, Multiaddr } from '@multiformats/multiaddr';

export * from './config'
export * from './types'
export { NodeServices } from './services'

export type CreateNodeOptions = {
  type: NodeType;
  addresses: Addresses;
  sk?: string;
  bootstrap?: Multiaddr[];
  delegatedRouting?: string;
  trustlessGateways?: string[];
}

export type RequiredCreateNodeOptions = Omit<Required<CreateNodeOptions>, 'sk' | 'delegatedRouting' | 'trustlessGateways'> & {
  delegatedRouting?: string;
  trustlessGateways?: string[];
  sk?: string;
};

export type CreateHeliaOptions = {   
  libp2p: Libp2p<NodeServices>,
  datastore: MemoryDatastore,
  blockstore: MemoryBlockstore
} & Pick<CreateNodeOptions, 'delegatedRouting' | 'trustlessGateways'>

export function buildConfig(options: CreateNodeOptions): RequiredCreateNodeOptions {
  const bootstrap = options.bootstrap || RELAY_MULTI_ADDR
    .split(",")
    .map((m) => m.trim())
    .filter((m) => !options.addresses.listen.includes(m) && !options.addresses.listen.includes(m))
    .map((m) => multiaddr(m))

  return {
    ...options,
    bootstrap
  };
}

export async function discovery(node: Libp2p<NodeServices>, address: string) {
  const addresses = address.split(",");
  for (const address of addresses) {
    await node.dial(multiaddr(address.trim()));
  }
}

export async function createNode(
  options: RequiredCreateNodeOptions
) {
  console.log('Creating Node with options:', options);

  const { addresses, sk, type, bootstrap } =options;
  const blockstore = new MemoryBlockstore()
  console.log('Initialized MemoryBlockstore');
  const datastore = new MemoryDatastore();
  console.log('Initialized MemoryDatastore');
  const privateKey = sk ? privateKeyFromRaw(Buffer.from(sk, 'hex')) : undefined;
  const peerDiscovery = bootstrap ? [
    libp2pBootstrap({
      list: bootstrap.map((ma) => ma.toString())
    })
  ] : [];

  const libp2p = await createLibp2p<NodeServices>({
    addresses,
    privateKey,
    peerDiscovery,
    connectionEncrypters: [
      noise()
    ],
    connectionGater: {
      denyDialMultiaddr: () => {
        return false;
      },
    },
    streamMuxers: [yamux()],
    datastore,
    transports: getDefaultTransports(type),
    services: getDefaultServices(type),
    start: false
  });

  console.log('Libp2p instance created');
  const node = await createHelia({
    libp2p, 
    datastore, 
    blockstore,
  });
  
  console.log('Helia node created');
  return {
    node,
    libp2p,
    fs: strings(node)
  };
}

export async function createHelia(
  options: CreateHeliaOptions
) {
  console.log('Creating Helia with options:', options);
  const { libp2p,  datastore, blockstore } = options;

  const blockBrokers = [
    trustlessGateway({
      allowInsecure:true,
      allowLocal: true,
    }),
    bitswap()
  ];

  const routers =  [
    libp2pRouting(libp2p),
    delegatedHTTPRouting(DELEGATED_ROUTING_V1_HOST),
    httpGatewayRouting({gateways:trustlessGateways})
  ]

  return createHeliaNode({
    blockBrokers,
    routers,
    datastore,
    blockstore,
    libp2p,
  });
}
