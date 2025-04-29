import { BigDecimal } from "generated";
import {
  STATIC_TOKEN_DEFINITIONS,
  StaticTokenDefinition,
} from "./staticTokenDefinition";
import { BLOCKDAG_TESTNET_ID } from "./constants";
import { Address } from ".";

export enum ChainId {
  BLOCKDAG_TESTNET_ID = 1043
}

// Note: All token and pool addresses should be lowercased!
export type SubgraphConfig = {
  // deployment address
  // e.g. https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments
  factoryAddress: string;

  // the address of a pool where one token is a stablecoin and the other is a
  // token that tracks the price of the native token use this to calculate the
  // price of the native token, so prefer a pool with highest liquidity
  stablecoinWrappedNativePoolAddress: string;

  // true is stablecoin is token0, false if stablecoin is token1
  stablecoinIsToken0: boolean;

  // the address of a token that tracks the price of the native token, most of
  // the time, this is a wrapped asset but could also be the native token itself
  // for some chains
  wrappedNativeAddress: string;

  // the mimimum liquidity in a pool needed for it to be used to help calculate
  // token prices. for new chains, this should be initialized to ~4000 USD
  minimumNativeLocked: BigDecimal;

  // list of stablecoin addresses
  stablecoinAddresses: string[];

  // a token must be in a pool with one of these tokens in order to derive a
  // price (in addition to passing the minimumEthLocked check). This is also
  // used to determine whether volume is tracked or not.
  whitelistTokens: string[];

  // token overrides are used to override RPC calls for the symbol, name, and
  // decimals for tokens. for new chains this is typically empty.
  tokenOverrides: StaticTokenDefinition[];

  // skip the creation of these pools in handlePoolCreated. for new chains this is typically empty.
  poolsToSkip: string[];

  // initialize this list of pools and token addresses on factory creation. for new chains this is typically empty.
  poolMappings: Array<`0x${string}`[]>;

  // tokens to skip
  tokensToSkip: Address[];
};

export function getChainConfig(chainId: number): SubgraphConfig {
  // subgraph does not support case switch with strings, hence this if else block
  if (chainId == BLOCKDAG_TESTNET_ID) {
    return {
      factoryAddress: "0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0",
      stablecoinWrappedNativePoolAddress:
        "0xC79DA839Fd3044a477D6542A1e7B7c99B7dE7169", // WETH-USDC 0.3% pool
      stablecoinIsToken0: true,
      wrappedNativeAddress: "0xC97B4e92fB267bB11b1CD2d475F9E8c16b433289", // WETH
      minimumNativeLocked: BigDecimal("20"),
      stablecoinAddresses: [
        "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
        "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3", // USDT
      ],
      whitelistTokens: [
        "0xC97B4e92fB267bB11b1CD2d475F9E8c16b433289", // WETH
        "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3", // USDT
      ],
      tokenOverrides: STATIC_TOKEN_DEFINITIONS[BLOCKDAG_TESTNET_ID],
      poolsToSkip: [],
      poolMappings: [],
      tokensToSkip: [],
    };
  } else {
    throw new Error("Unsupported Network");
  }
}
