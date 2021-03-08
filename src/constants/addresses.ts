import { SupportedNetworks } from './networks'
import { Token } from '../types/index'

type TokensTyps = {
  [key in SupportedNetworks]: Token[]
}

const isPublic = process.env.REACT_APP_PUBLIC === 'true'
export const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

export const eth: Token = {
  name: 'Ether',
  id: ZERO_ADDR,
  symbol: 'ETH',
  decimals: 18,
}

export const tokens: TokensTyps = {
  '1': [
    eth,
    {
      name: 'USDC',
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      name: 'Wrapped Ether',
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      symbol: 'WETH',
      decimals: 18,
    },
  ],
  '42': [
    eth,
    {
      name: 'USDC',
      id: '0xf5cb5408b40e819e7db5347664be03b52accac9d',
      symbol: 'USDC',
      decimals: 6,
      canMint: true,
    },
    {
      name: 'Wrapped Ether',
      id: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      name: 'Wrapped Bitcoin',
      id: '0xd7c8c2f7b6ebdbc88e5ab0101dd24ed5aca58b0f',
      symbol: 'WBTC',
      decimals: 8,
      canMint: true,
    },
  ],
}

type SystemAddresses = {
  [key in SupportedNetworks]: {
    controller: string
    factory: string
    addressBook: string
    whitelist: string
    pool: string
    zeroxExchange: string
    zeroxERCProxy: string
    zeroxStaking: string
  }
}

export const addresses: SystemAddresses = {
  '1': {
    controller: isPublic ? '0x4ccc2339F87F6c59c6893E1A678c2266cA58dC72' : '0xde158Fa7022f11707d4a3570eec4621B35d83829',
    factory: isPublic ? '0x7C06792Af1632E77cb27a558Dc0885338F4Bdf8E' : '0xE21127f47B365d3b1467746804f32BF8dCf47e26',
    addressBook: isPublic ? '0x1E31F2DCBad4dc572004Eae6355fB18F9615cBe4' : '0x57ADe7D5E9D2F45A07f8039Da7228ACC305fbeaF',
    pool: isPublic ? '0x5934807cC0654d46755eBd2848840b616256C6Ef' : '0x0Cb5BDBf1726f7CC720B21EA910ACeda9FdDf680',
    whitelist: isPublic ? '0xa5EA18ac6865f315ff5dD9f1a7fb1d41A30a6779' : '0x2244364c94a9FCb6f9ae3A4cF38f279706011882',
    zeroxExchange: '0x61935cbdd02287b511119ddb11aeb42f1593b7ef',
    zeroxERCProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    zeroxStaking: '0xa26e80e7dea86279c6d778d702cc413e6cffa777',
  },
  '42': {
    controller: isPublic ? '0xdee7d0f8ccc0f7ac7e45af454e5e7ec1552e8e4e' : '0xa84cff11957a0a08a3e1d568ed1caaf47626c1f3',
    factory: isPublic ? '0xb9d17ab06e27f63d0fd75099d5874a194ee623e2' : '0x32b5a18238BAdF23F8E88669de2bD3671ff7BF83',
    addressBook: isPublic ? '0x8812f219f507e8cfe9d2f1e790164714c5e06a73' : '0x4163Bf53878B2169Ea9E404b9E840FA010DbF949',
    pool: isPublic ? '0x8c7c60d766951c5c570bbb7065c993070061b795' : '0xFf7a2BD21f6dAb62948Bb7545266E9a6b2a0bEb2',
    whitelist: isPublic ? '0x9164eB40a1b59512F1803aB4C2d1dE4B89627A93' : '0xc990BB199c0ed8CEE305bD1A4c50A87029AdfAE3',
    zeroxExchange: '0x4eacd0af335451709e1e7b570b8ea68edec8bc97',
    zeroxERCProxy: '0xf1ec01d6236d3cd881a0bf0130ea25fe4234003e',
    zeroxStaking: '0xbab9145f1d57cd4bb0c9aa2d1ece0a5b6e734d34',
  },
}

export const blacklistOTokens = {
  '1': [ZERO_ADDR],
  '42': [ZERO_ADDR],
}

type KnownOperator = {
  address: string
  name: string
  description: string
  author: string
  audited: boolean
}

export const knownOperators: {
  [key in SupportedNetworks]: KnownOperator[]
} = {
  '1': [
    {
      address: isPublic ? '0x8f7dd610c457fc7cb26b0f9db4e77581f94f70ac' : '0xa05157b27b7db2eb63bb0c11412b71e7de027f89',
      name: 'PayableProxy',
      description: 'Proxy contract to help mint calls with ETH instead of WETH',
      audited: true,
      author: 'Opyn',
    },
  ],
  '42': [
    {
      address: isPublic ? '0x5957a413f5ac4bcf2ba7c5c461a944b548adb1a5' : '0xe501e882f6e5f049899e02b7e48d89f223cb2a4f',
      name: 'PayableProxy',
      description: 'Proxy contract to help mint calls with ETH instead of WETH',
      audited: true,
      author: 'Opyn',
    },
  ],
}

export const zx_exchange = {
  '1': '0x61935cbdd02287b511119ddb11aeb42f1593b7ef',
  '42': '0x4eacd0af335451709e1e7b570b8ea68edec8bc97',
}

export const getUSDC = (networkId: SupportedNetworks) => {
  return tokens[networkId].find(t => t.symbol === 'USDC') || eth
}

export const getWeth = (networkId: SupportedNetworks) => {
  return tokens[networkId].find(t => t.symbol === 'WETH') as Token
}

export const getPayableProxyAddr = (networkId: SupportedNetworks) => {
  return knownOperators[networkId].find(o => o.name === 'PayableProxy') as KnownOperator
}
