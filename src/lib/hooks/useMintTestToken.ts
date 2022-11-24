import { Currency, CurrencyAmount } from 'donex-sdk/sdk-core'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useTokenContract } from 'hooks/useContract'
import { useCallback } from 'react'
import { AccountInterface, InvokeFunctionResponse } from 'starknet'
import { bnToUint256 } from 'starknet/utils/uint256'

export function useMintTestToken(
  amountToMint: CurrencyAmount<Currency> | undefined
): [() => Promise<{ response: InvokeFunctionResponse; tokenAddress: string } | undefined>] {
  const { chainId, provider, account } = useWeb3React()
  const token = amountToMint?.currency?.isToken ? amountToMint.currency : undefined

  const tokenContract = useTokenContract(token?.address)

  const mintTestToken = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToMint) {
      return logFailure('missing amount to approve')
    } else if (!account) {
      return logFailure('no account')
    }

    const txn = tokenContract.populate('mint', [account, bnToUint256(amountToMint.quotient.toString())])

    return ((provider as any).provider as AccountInterface)
      .execute(txn)
      .then((response: InvokeFunctionResponse) => {
        return {
          response,
          tokenAddress: token.address,
        }
      })
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [chainId, token, tokenContract, amountToMint, account, provider])

  return [mintTestToken]
}
