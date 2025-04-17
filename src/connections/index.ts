import { noise } from '@chainsafe/libp2p-noise'

import { NodeType } from '../types';

export function getConnectionEncrypters(type: NodeType) {
    return [
      noise()
    ]
  }
  