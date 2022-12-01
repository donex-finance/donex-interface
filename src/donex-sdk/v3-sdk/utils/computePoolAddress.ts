import { Token } from 'donex-sdk/sdk-core'
import { calculateContractAddressFromHash, pedersen } from 'starknet/utils/hash'

import { FeeAmount, SWAP_POOL_CLASS_HASH, SWAP_POOL_PROXY_CLASS_HASH, TICK_SPACINGS } from '../constants'

const cache: any = {}

/**
 * Computes a pool address
 * @param factoryAddress The Donex factory address
 * @param tokenA The first token of the pair, irrespective of sort order
 * @param tokenB The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @param initCodeHashManualOverride Override the init code hash used to compute the pool address if necessary
 * @returns The pool address
 */
export function computePoolAddress({
  factoryAddress,
  tokenA,
  tokenB,
  fee,
  initCodeHashManualOverride,
}: {
  factoryAddress: string
  tokenA: Token
  tokenB: Token
  fee: FeeAmount
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

  const key = factoryAddress + token0.address + token1.address + fee.toString()
  if (cache[key]) {
    return cache[key]
  }

  const salt = pedersen([token0.address, token1.address])
  const address = calculateContractAddressFromHash(
    salt,
    SWAP_POOL_PROXY_CLASS_HASH,
    [SWAP_POOL_CLASS_HASH, TICK_SPACINGS[fee], fee.valueOf(), token0.address, token1.address, factoryAddress],
    factoryAddress
  )
  cache[key] = address
  return address
}
