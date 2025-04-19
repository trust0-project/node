import SDK from '@hyperledger/identus-edge-agent-sdk';
import { v4 as uuidv4 } from 'uuid';
import { PROTOCOLS } from '../types';
import { fromDIDCOMMType, toDIDCOMMType } from './utils';



abstract class BaseMessage implements Partial<SDK.Domain.Message> {
  public id = uuidv4();
  public typ = "application/didcomm-plain+json";
  public from: SDK.Domain.DID;
  public to: SDK.Domain.DID;

  public body: any = {};
  public thid: string = uuidv4();
  public attachments: SDK.Domain.Message['attachments'] = [];

  public pthid?: string | undefined;
  public created_time?: number | undefined;
  public expires_time?: number | undefined;
  public from_prior?: string | undefined;
  abstract type: PROTOCOLS;

  constructor(data: Partial<SDK.Domain.Message>) {
    if (!data.from) {
      throw new Error("From is required");
    }

    if (!data.to) {
      throw new Error("To is required");
    }

    this.to = data.to;
    this.from = data.from;

    this.body = data.body || {};
    this.attachments = data.attachments || [];

    this.pthid = data.pthid;
    this.created_time = data.createdTime;
    this.expires_time = data.expiresTimePlus;
    this.from_prior = data.fromPrior;
  }

  is<T extends PROTOCOLS>(type: string | undefined): type is T {
    return !type ? false : type in PROTOCOLS;
  }
}

export class ProtocolMessage extends BaseMessage {
  public type!: any;

  constructor(data: Partial<SDK.Domain.Message>) {
    super(data);
    if (this.is<PROTOCOLS>(data.piuri)) {
      this.type = data.piuri;
    }
  }
}

export class ExchangeAuthenticateMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.emailExchangeAuthenticate);

  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<ExchangeAuthenticateMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new ExchangeAuthenticateMessage(json);
  }
}

export class CredentialOfferRequestMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.credentialOfferRequest);

  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<CredentialOfferRequestMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new CredentialOfferRequestMessage(json);
  }

  respond(message: Partial<SDK.Domain.Message>): CredentialOfferMessage {
    console.log(`Answering to offer ${this.thid}`);
    return new CredentialOfferMessage({
      ...message,
      thid: this.thid,
    });
  }
}

export class CredentialOfferMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.credentialOffer);

  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<CredentialOfferMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new CredentialOfferMessage(json);
  }
}

export class ExchangePresentationMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.emailExchangePresentation);
  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<ExchangePresentationMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new ExchangePresentationMessage(json);
  }
}

export class ExchangeRequestPresentationMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.emailExchangePresentationRequest);
  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<ExchangeRequestPresentationMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new ExchangeRequestPresentationMessage(json);
  }
}

export class CredentialRequestMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.credentialRequest);
  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<CredentialRequestMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new CredentialRequestMessage(json);
  }
}

export class CredentialIssueMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.credentialIssue);
  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<CredentialIssueMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new CredentialIssueMessage(json);
  }
}

export class ExchangeDeliveryMessage extends ProtocolMessage {
  public type = toDIDCOMMType(PROTOCOLS.emailExchangeDelivery);
  static async fromJSON(
    json: Partial<SDK.Domain.Message>
  ): Promise<ExchangeDeliveryMessage> {
    json.piuri && fromDIDCOMMType(json.piuri);
    return new ExchangeDeliveryMessage(json);
  }
}