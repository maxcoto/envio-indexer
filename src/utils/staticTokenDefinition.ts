import { BLOCKDAG_TESTNET_ID } from "./constants";
import { publicClients } from "./viem";

// Initialize a Token Definition with the attributes
export type StaticTokenDefinition = {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply?: bigint;
};

export const getStaticDefinition = (
  tokenAddress: string,
  staticDefinitions: Array<StaticTokenDefinition>
): StaticTokenDefinition | null => {
  // Search the definition using the address
  for (let i = 0; i < staticDefinitions.length; i++) {
    const staticDefinition = staticDefinitions[i];
    if (staticDefinition.address.toLowerCase() == tokenAddress.toLowerCase()) {
      return staticDefinition;
    }
  }

  // If not found, return null
  return null;
};

export const STATIC_TOKEN_DEFINITIONS_ETH: Array<StaticTokenDefinition> = [
  {
    name: "Tether USD",
    address: "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3",
    symbol: "USDT",
    decimals: 6,
  },
  {
    name: "Wrapped Ether",
    address: "0xC97B4e92fB267bB11b1CD2d475F9E8c16b433289",
    symbol: "WETH",
    decimals: 18,
  },
];

export const STATIC_TOKEN_DEFINITIONS: {
  [key in keyof typeof publicClients]: Array<StaticTokenDefinition>;
} = {
  [BLOCKDAG_TESTNET_ID]: STATIC_TOKEN_DEFINITIONS_ETH,
};


