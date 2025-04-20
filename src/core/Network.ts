import SDK from '@hyperledger/identus-edge-agent-sdk';
import { Libp2p } from 'libp2p';
import { pipe } from 'it-pipe';
import { KeyInfo } from "@libp2p/keychain";
import { PROTOCOLS, StorageInterface } from '../types';
import { ProtocolMessage } from './message';
import { PeerId, PrivateKey } from '@libp2p/interface';
import { getPeerIDDID } from './crypto';
import { NodeServices } from '../services';
import { Multiaddr } from '@multiformats/multiaddr';
import { generateKeyPair,  } from "@libp2p/crypto/keys";
import { convertSecretKeyToX25519 } from '@stablelib/ed25519';

export class Network {
 

  get peer() {
    if (!this.p2p) return null;
    return this.p2p.peerId;
  }


  constructor(
    public storage: StorageInterface,
    public didWebHostname: string,
    public p2p: Libp2p<NodeServices>,
    public abortController: AbortController,
    private mercury: SDK.Domain.Mercury,
    private pluto: SDK.Pluto
  ) { }

  static getServicesForPeerDID(peerId: PeerId): SDK.Domain.Service[] {
    return [
      new SDK.Domain.Service(
        "didcomm",
        ["DIDCommMessaging"],
        {
          uri: peerId.toString(),
          accept: ["didcomm/v2"],
          routingKeys: []
        }
      )
    ];
  }
  
  async getDID(): Promise<SDK.Domain.DID> {
    return getPeerIDDID(this.p2p.peerId);
  }

  private async load() {
    if (this.pluto.state !== SDK.Domain.Startable.State.RUNNING) {
      await this.pluto.start();
    }
  }

  public async packMessage(
    message: ProtocolMessage
  ): Promise<Uint8Array> {
    await this.load();
    const packed = await this.mercury.packMessage(
      SDK.Domain.Message.fromJson(message)
    );
    return Buffer.from(packed);
  }

  async getKeyPair(email: string) {
    if (!this.p2p.services.keychain) {
        throw new Error('Keychain not initialized');
    }
    const keyName = `key-${Buffer.from(email).toString('hex')}`;
    let keyInfo: KeyInfo;
    try {
        keyInfo = await this.p2p.services.keychain.findKeyByName(keyName)
    } catch (error) {
        const ed25519Key = await generateKeyPair('Ed25519')
        const x25519Key = await convertSecretKeyToX25519(ed25519Key.raw)
        await this.pluto.storePrivateKey(
          new SDK.Ed25519PrivateKey(ed25519Key.raw)
        )
        await this.pluto.storePrivateKey(
          new SDK.X25519PrivateKey(x25519Key)
        )
        keyInfo = await this.p2p.services.keychain.importKey(keyName, ed25519Key)
    } finally {
        return this.p2p.services.keychain.exportKey(keyName);
    }
}

  public async unpackMessage(message: Uint8Array) {
    await this.load();
    const unpacked = await this.mercury.unpackMessage(Buffer.from(message).toString());
    return unpacked;
  }

  public getServiceProtocol(protocol: PROTOCOLS) {
    return `/service/djack.email${protocol}`;
  }

  public async sendMessage(peer: any, protocol: string, message: Uint8Array) {
    await this.load();
    const stream = await this.p2p.dialProtocol(peer, protocol);
    const result = await pipe([message], stream.sink);
    await stream.close({ signal: this.abortController.signal });
    return result;
  }

  public async dial(peer: any) {
    return this.p2p.dial(peer, { signal: this.abortController.signal });
  }

  public async dialProtocol(
    peer: PeerId | Multiaddr | Multiaddr[],
    protocols: string | string[]
  ) {
    const dial = {
      from: this.peer?.toString(),
      to: peer.toString(),
    };
    console.log(
      `[${JSON.stringify(protocols)}]: Dialing ${dial.from} to ${dial.to}`
    );
    const connection = await this.dial(peer);

    return connection.newStream(protocols);
  }

  public async sendAndGetResponse(
    peer: Multiaddr | Multiaddr[] | PeerId,
    protocol: string,
    message: Uint8Array
  ): Promise<SDK.Domain.Message> {
    try {
      const stream = await this.dialProtocol(peer, protocol);
      const results = new Promise<SDK.Domain.Message>((resolve, reject) => {
        return pipe([message], stream, async (source) => {
          try {
            for await (const data of source) {
              const unpacked = await this.unpackMessage(data.subarray());
              return resolve(unpacked);
            }
          } catch (err) {
            console.log(err);
            return reject(err);
          }
        });
      });

      await results;
      await stream.close({ signal: this.abortController.signal });
      return results;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

}