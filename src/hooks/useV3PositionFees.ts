import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from 'donex-sdk/sdk-core'
import { Pool } from 'donex-sdk/v3-sdk'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useState } from 'react'
import { toBN, toFelt } from 'starknet/utils/number'
import { bnToUint256, uint256ToBN } from 'starknet/utils/uint256'
import { unwrappedToken } from 'utils/unwrappedToken'

import { useV3NFTPositionManagerContract } from './useContract'

const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

// compute current + counterfactual fees for a v3 position
export function useV3PositionFees(
  pool?: Pool,
  tokenId?: BigNumber,
  asWETH = false
): [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined] {
  const tokenIdHexString = tokenId?.toHexString()

  const positionManager = useV3NFTPositionManagerContract(true)
  const owner: string | undefined = useSingleCallResult(tokenId ? positionManager : null, 'ownerOf', [
    bnToUint256(toBN(tokenIdHexString || '0')),
  ]).result?.owner

  const latestBlockNumber = useBlockNumber()

  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>()
  useEffect(() => {
    if (positionManager && tokenIdHexString && owner) {
      positionManager.callStatic
        .collect(
          bnToUint256(tokenIdHexString || 0),
          owner.toString(),
          toFelt(toBN(MAX_UINT128.toString())),
          toFelt(toBN(MAX_UINT128.toString()))
        )
        .then((results) => {
          setAmounts([
            BigNumber.from(uint256ToBN(results.amount0).toString()),
            BigNumber.from(uint256ToBN(results.amount1).toString()),
          ])
        })
    }
  }, [positionManager, tokenIdHexString, owner, latestBlockNumber])
  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(asWETH ? pool.token0 : unwrappedToken(pool.token0), amounts[0].toString()),
      CurrencyAmount.fromRawAmount(asWETH ? pool.token1 : unwrappedToken(pool.token1), amounts[1].toString()),
    ]
  } else {
    return [undefined, undefined]
  }
}
