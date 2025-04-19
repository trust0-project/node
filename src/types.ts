import { WebSocketsInit } from '@libp2p/websockets';
import type { PeerId } from "@libp2p/interface-peer-id";
import SDK from '@hyperledger/identus-edge-agent-sdk';
export type NodeType = 'browser' | 'relay' | 'server';
export type Addresses = {
  listen: string[],
  announce?: string[]
}

export type WebSocketsOptions = {
  ws?: WebSocketsInit['websocket'],
  server?: WebSocketsInit['http'] | WebSocketsInit['https']
}


export enum PROTOCOLS {
  emailExchangeAuthenticate = "/email-exchange/v1/authenticate",
  emailExchangePresentation = "/email-exchange/v1/present-proof/3.0/presentation",
  emailExchangePresentationRequest = "/email-exchange/v1/present-proof/3.0/request-presentation",
  emailExchangeDelivery = "/email-exchange/v1/delivery",
  credentialOfferRequest = "/email-exchange/v1/issue-credential/3.0/offer-credential-request",
  credentialOffer = "/email-exchange/v1/issue-credential/3.0/offer-credential",
  credentialRequest = "/email-exchange/v1/issue-credential/3.0/request-credential",
  credentialIssue = "/email-exchange/v1/issue-credential/3.0/issue-credential",
}

export abstract class DIDFactoryAbstract {
  abstract apollo: SDK.Apollo;
  abstract castor: SDK.Domain.Castor;
  abstract createPeerDID(services: SDK.Domain.Service[]): Promise<SDK.Domain.DID>;
  abstract createPeerDIDWithKeys(keyPair: SDK.Domain.KeyPair, services: SDK.Domain.Service[]): Promise<SDK.Domain.DID>;
}

export abstract class AbstractStore {
  abstract findKeysByDID(search?: {
    did?: string | string[];
    peerId?: string | string[];
  }): Promise<SDK.Domain.PrivateKey[]>;
  abstract addDIDKey(did: SDK.Domain.DID, peerId: PeerId, key: SDK.Domain.PrivateKey): Promise<void>;
  abstract findAllDIDs(): Promise<SDK.PeerDID[]>;
}

export type StorageInterface = { store: AbstractStore };

export enum ExportFormats {
  JWK = "JWK",
}

export abstract class AbstractExportingKey extends SDK.Domain.Key {
  abstract export(format: ExportFormats): Uint8Array;
  abstract canExport(): this is AbstractExportingKey;
}