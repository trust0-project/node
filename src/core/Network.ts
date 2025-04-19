import SDK from '@hyperledger/identus-edge-agent-sdk';
import { RIDBStore } from '@trust0/identus-store'
import createLevelDB from '@trust0/ridb-level';
import { Libp2p } from 'libp2p';
import { pipe } from 'it-pipe';

import { PROTOCOLS, StorageInterface } from '../types';
import { ProtocolMessage } from './message';
import { PeerId } from '@libp2p/interface';
import { getPeerIDDID } from './crypto';
import { NodeServices } from '../services';

export class Network {
  private _mercury!: SDK.Mercury;

  get mercury() {
    if (!this._mercury) {
      throw new Error("Mercury not initialized");
    }
    return this._mercury;
  }


  constructor(
    public storage: StorageInterface,
    public didWebHostname: string,
    public p2p: Libp2p<NodeServices>,
    public abortController: AbortController
  ) { }

  private async loadMercury() {
    const apollo = new SDK.Apollo();
    const castor = new SDK.Castor(apollo);
    const level = await createLevelDB();
    const store = new RIDBStore({
      dbName: 'identus',
      //TODO: potential issues here
      storageType: level as any
    })
    const pluto = new SDK.Pluto(store, apollo);
    const protocol = new SDK.DIDCommWrapper(apollo, castor, pluto);
    const fetchApi = new SDK.ApiImpl();
    return new SDK.Mercury(castor, protocol, fetchApi);
  }

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
    this._mercury ??= await this.loadMercury();
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

}