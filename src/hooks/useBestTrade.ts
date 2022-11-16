import { Currency, CurrencyAmount, TradeType } from 'donex-sdk/sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'

import { useClientSideV3Trade } from './useClientSideV3Trade'
import useDebounce from './useDebounce'

/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  // only use client side router if routing api trade failed or is not supported
  const bestV3Trade = useClientSideV3Trade(tradeType, debouncedAmount, debouncedOtherCurrency)

  // only return gas estimate from api if routing api trade is used
  return useMemo(
    () => ({
      ...bestV3Trade,
    }),
    [bestV3Trade]
  )
}
