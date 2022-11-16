// a list of tokens by chain
import { Currency, Token } from 'donex-sdk/sdk-core'

import { SupportedChainId } from './chains'
import {
  ETH_MAINNET,
  nativeOnChain,
  USDC_MAINNET,
  USDC_TESTNET,
  WRAPPED_NATIVE_CURRENCY,
  ZOKE2_MAINNET,
  ZOKE2_TESTNET,
} from './tokens'

type ChainTokenList = {
  readonly [chainId: number]: Token[]
}

type ChainCurrencyList = {
  readonly [chainId: number]: Currency[]
}

const WRAPPED_NATIVE_CURRENCIES_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCY)
    .map(([key, value]) => [key, [value]])
    .filter(Boolean)
)

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET], USDC_MAINNET],
  [SupportedChainId.TESTNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.TESTNET], USDC_TESTNET],
}
export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainCurrencyList = {
  [SupportedChainId.MAINNET]: [nativeOnChain(SupportedChainId.MAINNET), USDC_MAINNET, ZOKE2_MAINNET],
  [SupportedChainId.TESTNET]: [nativeOnChain(SupportedChainId.TESTNET), USDC_MAINNET, ZOKE2_TESTNET],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_CURRENCIES_ONLY,
  [SupportedChainId.MAINNET]: [...WRAPPED_NATIVE_CURRENCIES_ONLY[SupportedChainId.MAINNET], USDC_MAINNET],
}
export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [SupportedChainId.MAINNET]: [[USDC_MAINNET, ETH_MAINNET]],
}
