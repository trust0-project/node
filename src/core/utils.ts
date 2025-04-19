import { PROTOCOLS } from '../types';



const protocolDomain = "https://djack.email";


export function fromDIDCOMMType(type: string) {
  const convertProtocol = type.replace(protocolDomain, "");
  const protocolValue =
    Object.keys(PROTOCOLS)[
    Object.values(PROTOCOLS).findIndex((value) => value === convertProtocol)
    ];
  if (protocolValue in PROTOCOLS) {
    console.log(`Protocol from JSON ${protocolValue}`);
    return protocolValue as PROTOCOLS;
  }
  throw new Error(`Invalid protocol ${convertProtocol}`);
}

export function toDIDCOMMType(protocol: PROTOCOLS) {
  return `${protocolDomain}${protocol}`;
}
