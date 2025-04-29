import { createPublicClient, http, defineChain } from "viem";

const blockdag_tesnet = defineChain({
  id: 1043,
  name: 'Primordial BlockDAG Testnet',
  network: 'blockdag-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.primordial.bdagscan.com/'],
      webSocket: ['wss://rpc.primordial.bdagscan.com/'],
    },
    public: {
      http: ['https://rpc.primordial.bdagscan.com/'],
      webSocket: ['wss://rpc.primordial.bdagscan.com/'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://primordial.bdagscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0x26CC4A46484da4686c4D6E77767A6d7740F63f63',
      blockCreated: 255092,
    },
  },
})

export enum ChainId {
  BLOCKDAG_TESTNET = 1043
}

export const publicClients = {
  1043: createPublicClient({
    chain: blockdag_tesnet,
    transport: http(),
  })
};
