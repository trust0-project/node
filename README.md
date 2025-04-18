# Trust0 Node configuration
This repository contains the node configuration for [@trust0/relay](https://github.com/trust0-project/relay) and [@trust0/delegated-routing](https://github.com/trust0-project/delegated-routing)

Package configures the @helia configuration required to run trust0 p2p network.

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `DELEGATED_ROUTING_V1_HOST` | Host URL for the delegated routing service | `http://localhost:8081` |
| `NEXT_PUBLIC_DELEGATED_ROUTING_V1_HOST` | Host URL for the delegated routing service (for Next.js) | `http://localhost:8081` |
| `RELAY_MULTI_ADDR` | Multiaddress for the relay service | `/ip4/127.0.0.1/tcp/5050/ws` |
| `NEXT_PUBLIC_RELAY_MULTI_ADDR` | Multiaddress for the relay service (for Next.js) | `/ip4/127.0.0.1/tcp/5050/ws` |
| `TRUSTLESS_GATEWAY` | URL for the trustless gateway | `http://localhost:8080` |
| `NEXT_PUBLIC_TRUSTLESS_GATEWAY` | URL for the trustless gateway (for Next.js) | `http://localhost:8080` |