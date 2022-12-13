import multicall from 'abis/multicall.json'
import swap_pool from 'abis/swap_pool.json'
import token from 'abis/token.json'
import user_position_mgr from 'abis/user_position_mgr.json'
import swap_quoter from 'abis/swap_quoter.json'
import swap_router from 'abis/swap_router.json'
import { Abi } from 'starknet'

export const NFT_POSITION_MANAGER_ABI = user_position_mgr as Abi
export const ERC20_ABI = token as Abi
export const MULTICALL_ABI = multicall as Abi
export const SWAP_POOL_ABI = swap_pool as Abi
export const SWAP_QUOTER_ABI = swap_quoter as Abi
export const SWAP_ROUTER_ABI = swap_router as Abi