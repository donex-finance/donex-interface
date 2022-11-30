import { SWAP_POOL_ABI } from 'abis'
import { feltToInt } from 'donex-sdk/cc-core/utils/utils'
import { BigintIsh, Currency, Token } from 'donex-sdk/sdk-core'
import { computePoolAddress, FeeAmount, Pool } from 'donex-sdk/v3-sdk'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import JSBI from 'jsbi'
import { useMultipleContractSingleData, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { Contract as Interface } from 'starknet'
import { toHex } from 'starknet/utils/number'
import { uint256ToBN } from 'starknet/utils/uint256'

import { useV3NFTPositionManagerContract } from './useContract'

const POOL_STATE_INTERFACE = new Interface(SWAP_POOL_ABI, '')

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(factoryAddress: string, tokenA: Token, tokenB: Token, fee: FeeAmount): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
      }),
    }
    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null][] {
  const { chainId } = useWeb3React()
  const positionManager = useV3NFTPositionManagerContract()
  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  // const poolAddresses: (string | undefined)[] = useMemo(() => {
  //   const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
  //   if (!v3CoreFactoryAddress) return new Array(poolTokens.length)

  //   return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value))
  // }, [chainId, poolTokens])

  const results = useSingleContractMultipleData(
    positionManager,
    'get_pool_address',
    poolTokens.filter((v) => v).map((v) => (v !== undefined ? [v[0].address, v[1].address, v[2].toString()] : v))
  )
  const poolAddresses = useMemo(
    () =>
      results.map((v) => (v && v.result ? toHex(v.result.address) : '0x0')).map((v) => (v === '0x0' ? undefined : v)),
    [results]
  )
  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'get_cur_slot')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'get_liquidity')

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      if (poolAddresses[index] === undefined) return [PoolState.NOT_EXISTS, null]
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens
      if (!slot0s[index]) return [PoolState.INVALID, null]
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      if (!liquidities[index]) return [PoolState.INVALID, null]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]
      if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]
      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]
      const sqrtPriceX96 = uint256ToBN(slot0.sqrt_price_x96)
      if (!sqrtPriceX96 || sqrtPriceX96.eqn(0)) return [PoolState.NOT_EXISTS, null]
      const tick = parseInt(feltToInt(slot0.tick.toString()))
      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96.toString(), liquidity[0], tick)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [poolKeys, poolAddresses, poolTokens, slot0s, liquidities])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}
