import { CurrencyAmount, Token } from 'donex-sdk/sdk-core'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { uint256ToBN } from 'starknet/utils/uint256'

import { useTokenContract } from './useContract'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const { result } = useSingleCallResult(contract, 'allowance', inputs)
  const allowance = result ? uint256ToBN(result.remaining).toString() : ''
  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance) : undefined),
    [token, allowance]
  )
}
