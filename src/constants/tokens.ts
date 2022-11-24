import { Token } from 'donex-sdk/sdk-core'

import { SupportedChainId } from './chains'

export const NATIVE_CHAIN_ID = 'NATIVE'

// When decimals are not specified for an ERC20 token
// use default ERC20 token decimals as specified here:
// https://docs.openzeppelin.com/contracts/3.x/erc20
export const DEFAULT_ERC20_DECIMALS = 18

export const USDC_MAINNET = new Token(
  SupportedChainId.MAINNET,
  '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
  18,
  'USDC',
  'USD//C'
)

export const USDC_TESTNET = new Token(
  SupportedChainId.TESTNET,
  '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
  18,
  'USDC',
  'USD//C'
)

export const USDC: { [chainId in SupportedChainId]: Token } = {
  [SupportedChainId.MAINNET]: USDC_MAINNET,
  [SupportedChainId.TESTNET]: USDC_TESTNET,
}

export const ETH_MAINNET = new Token(
  SupportedChainId.MAINNET,
  '0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7',
  18,
  'ETH',
  'Ether'
)
export const ETH_TESTNET = new Token(
  SupportedChainId.TESTNET,
  '0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7',
  18,
  'ETH',
  'Ether'
)

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token } = {
  [SupportedChainId.MAINNET]: ETH_MAINNET,
  [SupportedChainId.TESTNET]: ETH_TESTNET,
}

export function nativeOnChain(chainId: number): Token {
  return WRAPPED_NATIVE_CURRENCY[chainId as SupportedChainId]
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: { [chainId in SupportedChainId]?: string } } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC_MAINNET.address,
    [SupportedChainId.TESTNET]: USDC_TESTNET.address,
  },
}

export const TEST_TOKEN = new Token(
  SupportedChainId.TESTNET,
  '0x4d60442a382305c214e79620bc5c695abe32678963e9ce6fa1eabf376048863',
  18,
  'DT1',
  'Donex Test Token1'
)
