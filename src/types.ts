export type NodeType = 'browser' | 'relay' | 'server';
export type Addresses = {
  listen: string[],
  announce?: string[]
}

