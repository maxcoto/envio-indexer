# Uniswap V3 Indexer

An multi-chain indexer for Uniswap V3 smart contracts.
Built with [Envio](https://envio.dev/).
Inspired by the [Uniswap V3 Subgraph](https://github.com/Uniswap/v3-subgraph).

Supported chains:

- **BlockDAG Testnet** (`chainId`: 1043)

The indexer is flexible enough to support all chains that Uniswap V3 is deployed on.

## Features

- Fast indexing and processing of Uniswap events
- Superset of the [Uniswap V3 Subgraph](https://github.com/Uniswap/v3-subgraph)
- Support for multiple blockchain networks
- GraphQL API for querying data

## Installation

1. Clone the repository:
   `git clone https://github.com/MaxosLLC/uniswap-v3-indexer.git`
2. Install dependencies:
   `cd uniswap-v3-indexer`
   `pnpm install`
3. Run Codegen:
   `pnpm run codegen`


## Usage

Start the indexer:
`pnpm run dev`

This will begin indexing smart contracts on all chains.

Envio will open up your browser to `http://localhost:8080/`, which is where you can view the data and make queries.

The local password is `testing`.

## Queries

This section will teach you how to query the indexer by fetching data points related to:

- Global Factory Data,
- Popular liquidity pools,
- Token Data,
- Periodic Volume,
- Multi-chain aggregations

and much more.

### A note about ID's

In order to make this indexer multi-chain, the ID of particular entities like pools, tokens, pools factories and positions are suffixed with ("-") and the chain ID **(`<ENTITY_ADDRESS>-<CHAIN_ID>`)**.

For example, the ID of a pool on Ethereum Mainnet (ID: 1) would be `0x12...6789f-1`.

Entities can be queried by their ID like this:

```graphql
query GetFactory {
  Factory_by_pk(id: "0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0-1043") {
    poolCount
    txCount
    totalVolumeUSD
    totalVolumeETH
  }
}
```

where the format is `EntityName_by_pk(id: "ID"-"chainId")`.
The return of querying by ID is a single `object`.

Alternatively, they can be filtered by the `address` and `chainId`:

```graphql
query GetFactory {
  Factory(
    where: {
      _and: [
        { chainId: { _eq: 1043 } }
        { address: { _eq: "0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0" } }
      ]
    }
  ) {
    poolCount
    txCount
    totalVolumeUSD
    totalVolumeETH
  }
}
```

which will return an **array** of factories that match the filter (even if it is only 1).

_NOTE: each entity has a `chainId` field._

## Global Data

Global data refers to data points about the Uniswap v3 protocol as a whole. Some examples of global data points are total value locked in the protocol, total pools deployed, or total transaction counts. Thus, to query global data you must pass in the Uniswap V3 **Factory** address `0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0-1043` and select the desired fields.

**Factory ID's**:

| **Chain Name**   | **chainId**                                      |
| ---------------- | ------------------------------------------------ |
| BlockDAG testnet | 0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0-1043  |


### Current Global Data

An example querying total pool count, transaction count, and total volume in USD and ETH:

```graphql
query GetFactory {
  Factory_by_pk(id: "0x13aA6774D72963A690bD43073a1B1a0AA21c9BA0-1043") {
    poolCount
    txCount
    totalVolumeUSD
    totalVolumeETH
  }
}
```

### Historical Global Data

You can also query historical data by specifying a day data ID with the `UniswapDayData` entity.
The ID specification for this is:
`timestamp rounded to current day by dividing by 86400 + "-" + chainId`.

```graphql
query GetDayData {
  UniswapDayData_by_pk(id: "18800-1043") {
    txCount
    volumeETH
    volumeUSD
  }
}
```

## Pool Data

To get data about a certain pool, pass in the pool address.

### General Pool Query

The query below returns the feeTier, spot price, and liquidity for the ETH-USDC pool.

```graphql
query GetETHUSDCPool {
  Pool_by_pk(id: "0xC79DA839Fd3044a477D6542A1e7B7c99B7dE7169-1043") {
    tick
    token0 {
      symbol
      address
      decimals
    }
    token1 {
      symbol
      address
      decimals
    }
    feeTier
    sqrtPrice
    liquidity
  }
}
```

### All Possible Pools

The maxiumum items you can query at once is 1000. Thus to get all possible pools, you can interate using the skip variable. To get pools beyond the first 1000 you can also set the skip as shown below.

### Skipping First 1000 Pools

This query sets the offset (skip) value and returns the first 10 responses after the first 1000.

```graphql
query Get10PoolsAfterFirst1000 {
  Pool(offset: 1000, limit: 10, order_by: { txCount: desc }) {
    address
    chainId
    token0 {
      address
      symbol
      chainId
    }
    token1 {
      address
      symbol
      chainId
    }
  }
}
```

### Most Liquid Pools

Retrieve the top 1000 most liquid pools on Eth Mainnet. You can use this similar set up to orderBy other variables like number of swaps or volume.

```graphql
query Get1000MostLiquidPools {
  Pool(
    where: { chainId: { _eq: 1043 } }
    limit: 1000
    order_by: { liquidity: desc }
  ) {
    address
  }
}
```

### Pool Daily Aggregated

This query returns daily aggregated data for the first 10 days since the given timestamp for the UNI-ETH pool.

```graphql
query UNIETHAfterTimestamp {
  PoolDayData(
    limit: 10
    order_by: { date: asc }
    where: {
      _and: [
        { date: { _gt: 1633642435 } }
        {
          pool: {
            address: { _eq: "0xC79DA839Fd3044a477D6542A1e7B7c99B7dE7169" }
          }
        }
      ]
    }
  ) {
    date
    liquidity
    sqrtPrice
    token0Price
    token1Price
    volumeToken0
    volumeToken1
  }
}
```

## Swap Data

### General Swap Data

To query data about a particular swap, input the:
`transaction hash` + "-" + index in swaps Transaction array + "-" + `chainId`.

This query fetches data about the sender, receiver, amounts, transaction data, and timestamp for a particular swap.

```graphql
query GetSwap {
  Swap_by_pk(
    id: "0xf5749c498ede7440464dde7f82afa253c84b9780385fa4fada7f7256080abbf3-2-1043"
  ) {
    sender
    recipient
    amount0
    amount1
    transaction {
      transactionHash
      blockNumber
      gasUsed
      gasPrice
    }
    timestamp
    token0 {
      address
      symbol
    }
    token1 {
      address
      symbol
    }
  }
}
```

### Recent Swaps Within a Pool

You can set the `where` field to filter swap data by pool address. This example fetches data about multiple swaps for the USDC-USDT pool, ordered by timestamp.

```graphql
query GetRecentSwaps {
  Swap(
    where: {
      _and: [
        { chainId: { _eq: 1043 } }
        {
          pool: {
            address: { _eq: "0xC79DA839Fd3044a477D6542A1e7B7c99B7dE7169" }
          }
        }
      ]
    }
    order_by: { timestamp: desc }
  ) {
    pool {
      token0 {
        address
        chainId
        symbol
      }
      token1 {
        address
        chainId
        symbol
      }
    }
    sender
    recipient
    amount0
    amount1
  }
}
```

## Token Data

Input the the token contract address to fetch token data. Any token that exists in at least one Uniswap V3 pool can be queried. The output will aggregate data across all v3 pools that include the token.

### General Token Data

This queries the decimals, symbol, name, pool count, and volume in USD for the UNI token.

```graphql
query GetUSDCEth {
  Token_by_pk(id: "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3-1043") {
    address
    symbol
    name
    decimals
    volumeUSD
    poolCount
  }
}
```

### Token Daily Aggregated

You can fetch aggregate data about a specific token over a 24-hour period. This query gets 10-days of the 24-hour volume data for the UNI token ordered from oldest to newest.

```graphql
query Get10DaysOfTokenData {
  TokenDayData(
    limit: 10
    where: {
      _and: [
        { chainId: { _eq: 1043 } }
        {
          token: {
            address: { _eq: "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3" }
          }
        }
      ]
    }
    order_by: { date: asc }
  ) {
    date
    token {
      address
      chainId
      symbol
    }
    volumeUSD
  }
}
```

### All Tokens

Similar to retrieving all pools, you can fetch all tokens by using `offset`.

```graphql
query GetTokens {
  Token(offset: 1, limit: 10, where: { chainId: { _eq: 1043 } }) {
    address
    symbol
    name
  }
}
```

## Price Data

It's a good idea to get the current USD price of ETH if you're getting derived token values in ETH.

The `Bundle` entity stores the most up to date price of Eth in USD.

The `id` of each bundle is the `chainId`, as there will be 1 `bundle` per chain.

```graphql
query GetEthPrice {
  Bundle_by_pk(id: "1043") {
    ethPriceUSD
  }
}
```

## Liquidity Minting, Burning and Collecting

### Recent Mint Data

To get the most recent mints, the `Mint` entity should be queried. This query fetches the last 10 liquidity mints on the Ethereum Mainnet.

```graphql
query GetLast10Mints {
  Mint(
    where: { chainId: { _eq: 1043 } }
    order_by: { timestamp: desc }
    limit: 10
  ) {
    transaction {
      transactionHash
      timestamp
    }
    token0 {
      address
      symbol
    }
    token1 {
      address
      symbol
    }
    amount0
    amount1
  }
}
```

### Recent Burn Data

```graphql
query GetLast10Burns {
  Burn(
    where: { chainId: { _eq: 1043 } }
    order_by: { timestamp: desc }
    limit: 10
  ) {
    transaction {
      transactionHash
      timestamp
    }
    token0 {
      address
      symbol
    }
    token1 {
      address
      symbol
    }
    amount0
    amount1
  }
}
```

### Recent Liquidity Collection

When a liquidity provider collects their fees, the `Collect` event will be emitted.

These collection events can be queried as follows:

```graphql
query GetLast10Collects {
  Collect(
    where: { chainId: { _eq: 1043 } }
    order_by: { timestamp: desc }
    limit: 10
  ) {
    transaction {
      transactionHash
      timestamp
    }
    pool {
      address
      token0 {
        address
        symbol
      }
      token1 {
        address
        symbol
      }
    }
    timestamp
    amountUSD
    amount0
    amount1
    owner
  }
}
```

## Transaction Data

Every transaction on Uniswap V3 is indexed. You can query transaction data by the transaction hash.

You can also get nested data for fields such as swaps, mints, and burns.

```graphql
query GetLast10Txns {
  Transaction(
    limit: 10
    order_by: { timestamp: desc }
    where: { chainId: { _eq: 1043 } }
  ) {
    transactionHash
    blockNumber
    timestamp
    gasPrice
    swaps {
      id
    }
    mints {
      id
    }
    burns {
      id
    }
  }
}
```

## Hourly Data

### Fetch Pool Hourly Data

To get the data for the UNI-ETH pool on Eth Mainnet the last 6 logged hours, you can query the `PoolHourData` entity.

```graphql
query GetLast6HoursOfUniEthPool {
  PoolHourData(
    where: {
      _and: [
        { chainId: { _eq: 1043 } }
        {
          pool: {
            address: { _eq: "0xC79DA839Fd3044a477D6542A1e7B7c99B7dE7169" }
          }
        }
      ]
    }
    order_by: { periodStartUnix: desc }
    limit: 6
  ) {
    high
    low
    openPrice
    close
    txCount
  }
}
```

### Fetch Token Hourly Data

Similarly to the `PoolHourData`, the hourly token data can be queried with the `TokenHourData` entity.

```graphql
query GetLast6HoursOfUniToken {
  TokenHourData(
    where: {
      _and: [
        { chainId: { _eq: 1043 } }
        {
          token: {
            address: { _eq: "0x38e659126AeB5dE4C243229b34Bd99f11D5bb2D3" }
          }
        }
      ]
    }
    order_by: { periodStartUnix: desc }
    limit: 6
  ) {
    token {
      address
      name
      symbol
    }
    volumeUSD
    high
    low
    openPrice
    close
  }
}
```

## Multi-Chain Queries

Since the indexer is multi-chain, you can aggregate and query data.

Below are a few examples of how to get useful insights across multiple chains.

### Most liquid pools across supported chains

```graphql
query GetHighestLiquidityPoolsCrossChain {
  Pool(limit: 1000, order_by: { totalValueLockedUSD: desc }) {
    address
    liquidity
    totalValueLockedUSD
    token0 {
      address
      symbol
    }
    token1 {
      address
      symbol
    }
  }
}
```

###

## License

This project is licensed under the MIT License.
