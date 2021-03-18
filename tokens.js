const MAINNET = {
  DAI: {
    address: "0x09cabec1ead1c0ba254b09efb3ee13841712be14",
    tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
  },
  LINK: {
    address: "0xf173214c720f58e03e194085b1db28b50acdeead",
    tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
  },
  USDC: {
    address: "0x97dec872013f6b5fb443861090ad931542878126",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  USDT: {
    address: "0xc8313c965c47d1e0b5cdcd757b210356ad0e400c",
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  WBTC: {
    address: "0x4d2f5cfba55ae412221182d8475bc85799a5644b",
    tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
  },
  WETH: {
    address: "0xa2881a90bf33f03e7a3f803765cd2ed5c8928dfb",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
  },
};

const RINKEBY = {
  DAI: {
    tokenAddress: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
    decimals: 18,
  },
  LINK: {
    tokenAddress: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
    decimals: 18,
  },
};

const ROPSTEN = {
  DAI: {
    tokenAddress: "0xad6d458402f60fd3bd25163575031acdce07538d",
    decimals: 18,
  },
  LINK: {
    tokenAddress: "0x20fe562d797a42dcb3399062ae9546cd06f63280",
    decimals: 18,
  },
};

module.exports = { RINKEBY, MAINNET, ROPSTEN };
