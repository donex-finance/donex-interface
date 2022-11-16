import { BigNumber } from '@ethersproject/bignumber'
import { feltToInt } from 'donex-sdk/cc-core/utils/utils'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { toBN, toHex } from 'starknet/utils/number'
import { bnToUint256, uint256ToBN } from 'starknet/utils/uint256'
import { PositionDetails } from 'types/position'

import { useV3NFTPositionManagerContract } from './useContract'

interface UseV3PositionsResults {
  loading: boolean
  positions: PositionDetails[] | undefined
}

function useV3PositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const inputs = useMemo(
    () => (tokenIds ? tokenIds.map((tokenId) => [bnToUint256(toBN(tokenId.toString()))]) : []),
    [tokenIds]
  )
  const inputs_bn = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [tokenId]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'get_token_position', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        return {
          tokenId,
          fee: Number(result.pool_info.fee.toString()),
          feeGrowthInside0LastX128: BigNumber.from(uint256ToBN(result.position.fee_growth_inside0_x128).toString()),
          feeGrowthInside1LastX128: BigNumber.from(uint256ToBN(result.position.fee_growth_inside1_x128).toString()),
          liquidity: BigNumber.from(result.position.liquidity.toString()),
          nonce: BigNumber.from('0'),
          operator: '',
          tickLower: parseInt(feltToInt(result.position.tick_lower.toString())),
          tickUpper: parseInt(feltToInt(result.position.tick_upper.toString())),
          token0: toHex(result.pool_info.token0),
          token1: toHex(result.pool_info.token1),
          tokensOwed0: BigNumber.from(result.position.tokens_owed0.toString()),
          tokensOwed1: BigNumber.from(result.position.tokens_owed1.toString()),
        }
      })
    }
    return undefined
  }, [loading, error, results, tokenIds])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs_bn[i][0] })),
  }
}

interface UseV3PositionResults {
  loading: boolean
  position: PositionDetails | undefined
}

export function useV3PositionFromTokenId(tokenId: BigNumber | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)
  return {
    loading: position.loading,
    position: position.positions?.[0],
  }
}

export function useV3Positions(account: string | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(
    positionManager,
    'balanceOf',
    [account ?? undefined],
    { disabled: !account }
  )
  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult ? uint256ToBN(balanceResult.balance).toNumber() : undefined

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, bnToUint256(i)])
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance])

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs)
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults])

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is CallStateResult => !!result)
        .map((result) => BigNumber.from(uint256ToBN(result.tokenId).toString()))
    }
    return []
  }, [account, tokenIdResults])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(tokenIds)

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
  }
}
