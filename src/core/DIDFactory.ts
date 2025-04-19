import SDK from '@hyperledger/identus-edge-agent-sdk';
import type { PeerId } from "@libp2p/interface-peer-id";
import { privateKeyFromRaw } from "@libp2p/crypto/keys";
import { peerIdFromPrivateKey } from "@libp2p/peer-id";
import { DIDFactoryAbstract, StorageInterface } from '../types';

const apollo = new SDK.Apollo();
const castor = new SDK.Castor(apollo);



export class DIDFactory implements DIDFactoryAbstract {
  apollo = apollo;
  castor = castor;

  constructor(
    public storage: StorageInterface,
  ) { }

  async createPeerDID(services: SDK.Domain.Service[] = []) {
    const edPrivate = await apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.ED25519,
    })
    const edKeyPair: SDK.Domain.KeyPair = {
      curve: SDK.Domain.Curve.ED25519,
      privateKey: edPrivate,
      publicKey: edPrivate.publicKey(),
    };
    const x25519Private = await apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.ED25519,
    })
    const xKeyPair: SDK.Domain.KeyPair = {
      curve: SDK.Domain.Curve.X25519,
      privateKey: x25519Private,
      publicKey: x25519Private.publicKey(),
    }
    const keyPairs = [edKeyPair, xKeyPair];
    const publicKeys = keyPairs.map((keyPair) => keyPair.publicKey);
    const privateKeys = keyPairs.map((keyPair) => keyPair.privateKey);
    const did = await this.castor.createPeerDID(publicKeys, services);
    const ed = privateKeyFromRaw(
      Buffer.concat([edKeyPair.privateKey.raw, edKeyPair.publicKey.raw])
    )
    const peerId = peerIdFromPrivateKey(ed) as unknown as PeerId
    for (const priv of privateKeys) {
      await this.storage.store.addDIDKey(did, peerId, priv);
    }
    return did;
  }

  async createPeerDIDWithKeys(keyPair: SDK.Domain.KeyPair, services: SDK.Domain.Service[] = []) {
    const { publicKey: pk, privateKey: sk } = keyPair;
    const did = await this.castor.createPeerDID([pk], services);
    const ed = privateKeyFromRaw(Buffer.concat([sk.raw, pk.raw]))
    const peerId = peerIdFromPrivateKey(ed) as unknown as PeerId
    await this.storage.store.addDIDKey(did, peerId, sk);
    return did;
  }
}

