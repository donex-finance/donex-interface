import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from 'donex-sdk/v3-sdk'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, []),
}

export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x39137a630f42960ff67c3cb683f0b616764fb56774b026eeb623f1fbfd2ef87',
  [SupportedChainId.TESTNET]: '0x39137a630f42960ff67c3cb683f0b616764fb56774b026eeb623f1fbfd2ef87',
}

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x03b962a261e51bb859f98e31bee8675ef6f3280dc4e3a2f1f85a98c07832d82f', []),
}

export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x0734b73b8879207ade6a75ea6171ad52dafc395e699e6fd678658417f6803b5a', []),
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x37e72c3c1083e7e04e6173cd55b14414d236e091b26aba1f363add739052f57',
  [SupportedChainId.TESTNET]: '0x37e72c3c1083e7e04e6173cd55b14414d236e091b26aba1f363add739052f57',
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const TICK_LENS_ADDRESSES: AddressMap = {}

export const AddressZero = ''
