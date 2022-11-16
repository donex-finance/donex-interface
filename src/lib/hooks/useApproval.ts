import { MaxUint256 } from '@ethersproject/constants'
import { sendAnalyticsEvent } from 'analytics'
import { EventName } from 'analytics/constants'
import { getTokenAddress } from 'analytics/utils'
import { Currency, CurrencyAmount, Token } from 'donex-sdk/sdk-core'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useTokenContract } from 'hooks/useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useCallback, useMemo } from 'react'
import { AccountInterface, InvokeFunctionResponse } from 'starknet'
import { bnToUint256 } from 'starknet/utils/uint256'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

function useApprovalStateForSpender(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const { account } = useWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])
}

export function useApproval(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
  ApprovalState,
  () => Promise<{ response: InvokeFunctionResponse; tokenAddress: string; spenderAddress: string } | undefined>
] {
  const { chainId, provider } = useWeb3React()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  // check the current approval status
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, useIsPendingApproval)

  const tokenContract = useTokenContract(token?.address)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    const useExact = false
    // const estimatedGas = await tokenContract.estimateFee.approve(spender, MaxUint256).catch(() => {
    //   // general fallback for tokens which restrict approval amounts
    //   useExact = true
    //   return tokenContract.estimateFee.approve(spender, bnToUint256(amountToApprove.quotient.toString()))
    // })

    const txn = tokenContract.populate('approve', [
      spender,
      useExact ? bnToUint256(amountToApprove.quotient.toString()) : bnToUint256(MaxUint256.toString()),
    ])

    return ((provider as any).provider as AccountInterface)
      .execute(txn)
      .then((response: InvokeFunctionResponse) => {
        const eventProperties = {
          chain_id: chainId,
          token_symbol: token?.symbol,
          token_address: getTokenAddress(token),
        }
        sendAnalyticsEvent(EventName.APPROVE_TOKEN_TXN_SUBMITTED, eventProperties)
        return {
          response,
          tokenAddress: token.address,
          spenderAddress: spender,
        }
      })
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [approvalState, chainId, token, tokenContract, amountToApprove, spender, provider])

  return [approvalState, approve]
}
