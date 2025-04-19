import { type PeerId } from "@libp2p/interface-peer-id";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import { AbstractStore } from "../../../types";

const data: { keys: { did: SDK.Domain.DID; peerId: PeerId; key: SDK.Domain.PrivateKey }[] } = {
  keys: [],
};

class InMemory implements AbstractStore {
  async findKeysByDID(search: {
    did?: string | string[] | undefined;
    peerId?: string | string[] | undefined;
  }): Promise<SDK.Domain.PrivateKey[]> {
    const keys = data.keys
      .filter((key) => {
        if (!search || (!search.did && !search.peerId)) {
          return true;
        }
        if (search.did) {
          if (Array.isArray(search.did)) {
            return search.did.find((did) => did === key.did.toString());
          }
          return key.did.toString() === search.did;
        }
        if (search.peerId) {
          if (Array.isArray(search.peerId)) {
            return search.peerId.find(
              (peerId) => peerId.toString() === key.peerId.toString()
            );
          }
          return key.peerId.toString() === search.peerId;
        }
      })
      .map((record) => record.key);
    return keys;
  }
  async findAllDIDs(): Promise<SDK.PeerDID[]> {
    const keys = data.keys.map((record) => new SDK.PeerDID(record.did, [{
      keyCurve: {
        curve: record.key.curve as SDK.Domain.Curve
      },
      value: record.key.raw

    }]));
    return keys;
  }
  async addDIDKey(did: SDK.Domain.DID, peerId: PeerId, key: SDK.Domain.PrivateKey): Promise<void> {
    data.keys.push({
      did,
      key,
      peerId,
    });
  }
}

export const inMemory = new InMemory();
