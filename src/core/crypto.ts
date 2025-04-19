import SDK from '@hyperledger/identus-edge-agent-sdk';
import { PeerId } from '@libp2p/interface';
import {publicKeyFromRaw} from '@libp2p/crypto/keys'
import { convertPublicKeyToX25519 } from "@stablelib/ed25519";

import { Network } from './Network';
import { AbstractExportingKey, ExportFormats } from '../types';

const apollo = new SDK.Apollo();
const castor = new SDK.Castor(apollo);

export function createX25519PublicKeyFromEd25519PublicKey(
  publicKey: SDK.Ed25519PublicKey
) {
  return new ExportableX25519PublicKey(
    convertPublicKeyToX25519(publicKey.raw)
  );
}

export async function getPeerIDDID(peer: PeerId): Promise<SDK.Domain.DID> {
  const publicKey = peer.publicKey?.raw.slice(4);
  if (!publicKey) {
    throw new Error("No public key in peerId");
  }
  const pk = publicKeyFromRaw(publicKey);
  const ed25519Pub = new ExportableEd25519PublicKey(pk.raw);
  const x25519Pub = createX25519PublicKeyFromEd25519PublicKey(ed25519Pub);
  const services = Network.getServicesForPeerDID(peer);
  return castor.createPeerDID([ed25519Pub, x25519Pub], services)
}

export class ExportableEd25519PublicKey extends SDK.Ed25519PublicKey implements AbstractExportingKey {
    canExport(): this is AbstractExportingKey {
      return "export" in this;
    }
    export(format: ExportFormats): Uint8Array {
      if (format === ExportFormats.JWK) {
        return Buffer.from(
          JSON.stringify({
            crv: this.curve,
            kty: "OKP",
            x: Buffer.from(this.getEncoded()).toString('base64url'),
          })
        );
      }
      throw new Error("Method not implemented.");
    }
  }
  
  export class ExportableEd25519PrivateKey extends SDK.Ed25519PrivateKey implements AbstractExportingKey {
    canExport(): this is AbstractExportingKey {
      return "export" in this;
    }
    export(format: ExportFormats): Uint8Array {
      if (format === ExportFormats.JWK) {
        return Buffer.from(
          JSON.stringify({
            crv: this.curve,
            kty: "OKP",
            x: Buffer.from(this.publicKey().getEncoded()).toString('base64url'),
            d: Buffer.from(this.getEncoded()).toString('base64url'),
          })
        );
      }
      throw new Error("Method not implemented.");
    }
  }
  
  export class ExportableX25519PublicKey extends SDK.X25519PublicKey implements AbstractExportingKey {
    canExport(): this is AbstractExportingKey {
      return "export" in this;
    }
    export(format: ExportFormats): Uint8Array {
      if (format === ExportFormats.JWK) {
        return Buffer.from(
          JSON.stringify({
            crv: this.curve,
            kty: "OKP",
            x: Buffer.from(this.getEncoded()).toString('base64url'),
          })
        );
      }
      throw new Error("Method not implemented.");
    }
  }
  
  export class ExportableX25519PrivateKey extends SDK.X25519PrivateKey implements AbstractExportingKey {
    canExport(): this is AbstractExportingKey {
      return "export" in this;
    }
    export(format: ExportFormats): Uint8Array {
      if (format === ExportFormats.JWK) {
        return Buffer.from(
          JSON.stringify({
            crv: this.curve,
            kty: "OKP",
            x: Buffer.from(this.publicKey().getEncoded()).toString('base64url'),
            d: Buffer.from(this.getEncoded()).toString('base64url'),
          })
        );
      }
      throw new Error("Method not implemented.");
    }
  }
  