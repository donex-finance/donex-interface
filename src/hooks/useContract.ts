// eslint-disable-next-line simple-import-sort/imports
import { ERC20_ABI, MULTICALL_ABI, NFT_POSITION_MANAGER_ABI } from 'abis'
import { UserPositionMgr } from 'abis/types'
import {
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  TICK_LENS_ADDRESSES,
} from 'constants/addresses'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useMemo } from 'react'
import { Contract } from 'starknet'
import { getContract } from '../utils'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Contract>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useInterfaceMulticall() {
  return useContract<Contract>(MULTICALL_ADDRESS, MULTICALL_ABI, false) as Contract
}

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean): UserPositionMgr | null {
  return useContract<UserPositionMgr>(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFT_POSITION_MANAGER_ABI,
    withSignerIfPossible
  )
}

export function useQuoter(useQuoterV2: boolean) {
  return useContract(QUOTER_ADDRESSES, ERC20_ABI)
}

export function useTickLens(): Contract | null {
  const { chainId } = useWeb3React()
  const address = chainId ? TICK_LENS_ADDRESSES[chainId] : undefined
  return useContract(address, ERC20_ABI) as Contract | null
}
