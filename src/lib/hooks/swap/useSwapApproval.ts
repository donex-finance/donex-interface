import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { Trade } from 'donex-sdk/router-sdk'
import { Currency, CurrencyAmount, Percent, Token, TradeType } from 'donex-sdk/sdk-core'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useMemo } from 'react'

import { useApproval } from '../useApproval'

export { ApprovalState } from '../useApproval'

// wraps useApproveCallback in the context of a swap
export default function useSwapApproval(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
  amount?: CurrencyAmount<Currency> // defaults to trade.maximumAmountIn(allowedSlippage)
) {
  const { chainId } = useWeb3React()

  const amountToApprove = useMemo(
    () => amount || (trade && trade.inputAmount.currency.isToken ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [amount, trade, allowedSlippage]
  )
  const spender = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined

  return useApproval(amountToApprove, spender, useIsPendingApproval)
}
