import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from 'donex-sdk/v3-sdk'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

/* V3 Contract Addresses */
export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS, []),
}

export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x41838753cd8d2f0064f069ccc75793b1f374a7b86a0c122fb95a10dff223c98',
  [SupportedChainId.TESTNET]: '0x41838753cd8d2f0064f069ccc75793b1f374a7b86a0c122fb95a10dff223c98',
}

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x59b12dfeb4350cd811da70308a245bb8fb479cceccc9186d1f0c6d31bca1343', []),
}

export const QUOTER_ADDRESSES: AddressMap = {
  ...constructSameAddressMap('0x59b12dfeb4350cd811da70308a245bb8fb479cceccc9186d1f0c6d31bca1343', []),
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x59b12dfeb4350cd811da70308a245bb8fb479cceccc9186d1f0c6d31bca1343',
  [SupportedChainId.TESTNET]: '0x59b12dfeb4350cd811da70308a245bb8fb479cceccc9186d1f0c6d31bca1343',
}

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x65770b5283117639760beA3F867b69b3697a91dd',
}

export const TICK_LENS_ADDRESSES: AddressMap = {}

export const AddressZero = ''
