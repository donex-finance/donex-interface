// eslint-disable-next-line simple-import-sort/imports
import { SupportedChainId } from 'constants/chains'
import { ZERO_ADDRESS } from 'constants/misc'
import { nativeOnChain, NATIVE_CHAIN_ID, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

import { Chain, HistoryDuration } from './__generated__/TopTokens100Query.graphql'

export enum TimePeriod {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

export function toHistoryDuration(timePeriod: TimePeriod): HistoryDuration {
  switch (timePeriod) {
    case TimePeriod.HOUR:
      return 'HOUR'
    case TimePeriod.DAY:
      return 'DAY'
    case TimePeriod.WEEK:
      return 'WEEK'
    case TimePeriod.MONTH:
      return 'MONTH'
    case TimePeriod.YEAR:
      return 'YEAR'
  }
}

export const CHAIN_ID_TO_BACKEND_NAME: { [key: number]: Chain } = {
  [SupportedChainId.MAINNET]: 'STARKNET_MAINNET',
  [SupportedChainId.TESTNET]: 'STARKNET_TESTNET',
}

export function chainIdToBackendName(chainId: number | undefined) {
  return chainId && CHAIN_ID_TO_BACKEND_NAME[chainId]
    ? CHAIN_ID_TO_BACKEND_NAME[chainId]
    : CHAIN_ID_TO_BACKEND_NAME[SupportedChainId.MAINNET]
}

export const URL_CHAIN_PARAM_TO_BACKEND: { [key: string]: Chain } = {}

export function validateUrlChainParam(chainName: string | undefined) {
  return chainName && URL_CHAIN_PARAM_TO_BACKEND[chainName] ? URL_CHAIN_PARAM_TO_BACKEND[chainName] : 'STARKNET_MAINNET'
}

export const CHAIN_NAME_TO_CHAIN_ID: { [key: string]: SupportedChainId } = {
  STARKNET_MAINNET: SupportedChainId.MAINNET,
}

export const BACKEND_CHAIN_NAMES: Chain[] = ['STARKNET_MAINNET']

export function isValidBackendChainName(chainName: string | undefined): chainName is Chain {
  if (!chainName) return false
  for (let i = 0; i < BACKEND_CHAIN_NAMES.length; i++) {
    if (chainName === BACKEND_CHAIN_NAMES[i]) return true
  }
  return false
}

export function getTokenDetailsURL(address: string, chainName?: Chain, chainId?: number) {
  if (address === ZERO_ADDRESS && chainId && chainId === SupportedChainId.MAINNET) {
    return `/tokens/${CHAIN_ID_TO_BACKEND_NAME[chainId].toLowerCase()}/${NATIVE_CHAIN_ID}`
  } else if (chainName) {
    return `/tokens/${chainName.toLowerCase()}/${address}`
  } else if (chainId) {
    const chainName = CHAIN_ID_TO_BACKEND_NAME[chainId]
    return chainName ? `/tokens/${chainName.toLowerCase()}/${address}` : ''
  } else {
    return ''
  }
}

export function unwrapToken<T extends { address: string | null } | null>(chainId: number, token: T): T {
  if (!token?.address) return token

  const address = token.address.toLowerCase()
  const nativeAddress = WRAPPED_NATIVE_CURRENCY[chainId]?.address.toLowerCase()
  if (address !== nativeAddress) return token

  const nativeToken = nativeOnChain(chainId)
  return {
    ...token,
    ...nativeToken,
    address: NATIVE_CHAIN_ID,
    extensions: undefined, // prevents marking cross-chain wrapped tokens as native
  }
}
