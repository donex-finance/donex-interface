import { Protocol } from 'donex-sdk/router-sdk'
import { Currency, CurrencyAmount, Token, TradeType } from 'donex-sdk/sdk-core'
import { FeeAmount, Pool, Route as V3Route } from 'donex-sdk/v3-sdk'

import { nativeOnChain } from '../../constants/tokens'
import { GetQuoteResult, InterfaceTrade, V3PoolInRoute } from './types'

/**
 * Transforms a Routing API quote into an array of routes that can be used to create
 * a `Trade`.
 */
export function computeRoutes(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  tradeType: TradeType,
  quoteResult: Pick<GetQuoteResult, 'route'> | undefined
) {
  if (!quoteResult || !quoteResult.route || !currencyIn || !currencyOut) return undefined

  if (quoteResult.route.length === 0) return []

  const parsedTokenIn = parseToken(quoteResult.route[0][0].tokenIn)
  const parsedTokenOut = parseToken(quoteResult.route[0][quoteResult.route[0].length - 1].tokenOut)

  if (parsedTokenIn.address !== currencyIn.wrapped.address) return undefined
  if (parsedTokenOut.address !== currencyOut.wrapped.address) return undefined

  const parsedCurrencyIn = currencyIn.isNative ? nativeOnChain(currencyIn.chainId) : parsedTokenIn
  const parsedCurrencyOut = currencyOut.isNative ? nativeOnChain(currencyOut.chainId) : parsedTokenOut

  try {
    return quoteResult.route.map((_route) => {
      const route = _route as V3PoolInRoute[]
      if (route.length === 0) {
        throw new Error('Expected route to have at least one pair or pool')
      }
      const rawAmountIn = route[0].amountIn
      const rawAmountOut = route[route.length - 1].amountOut

      if (!rawAmountIn || !rawAmountOut) {
        throw new Error('Expected both amountIn and amountOut to be present')
      }

      const routeProtocol = getRouteProtocol(route)

      return {
        routev3:
          routeProtocol === Protocol.V3
            ? new V3Route(route.map(genericPoolPairParser) as Pool[], parsedCurrencyIn, parsedCurrencyOut)
            : null,
        routev2: null,
        mixedRoute: null,
        inputAmount: CurrencyAmount.fromRawAmount(parsedCurrencyIn, rawAmountIn),
        outputAmount: CurrencyAmount.fromRawAmount(parsedCurrencyOut, rawAmountOut),
      }
    })
  } catch (e) {
    // `Route` constructor may throw if inputs/outputs are temporarily out of sync
    // (RTK-Query always returns the latest data which may not be the right inputs/outputs)
    // This is not fatal and will fix itself in future render cycles
    console.error(e)
    return undefined
  }
}

export function transformRoutesToTrade<TTradeType extends TradeType>(
  route: ReturnType<typeof computeRoutes>,
  tradeType: TTradeType,
  blockNumber?: string | null,
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
): InterfaceTrade<Currency, Currency, TTradeType> {
  return new InterfaceTrade({
    v2Routes: [],
    v3Routes:
      route
        ?.filter((r): r is typeof route[0] & { routev3: NonNullable<typeof route[0]['routev3']> } => r.routev3 !== null)
        .map(({ routev3, inputAmount, outputAmount }) => ({ routev3, inputAmount, outputAmount })) ?? [],
    mixedRoutes: [],
    tradeType,
    gasUseEstimateUSD,
    blockNumber,
  })
}

const parseToken = ({ address, chainId, decimals, symbol }: GetQuoteResult['route'][0][0]['tokenIn']): Token => {
  return new Token(chainId, address, parseInt(decimals.toString()), symbol)
}

const parsePool = ({ fee, sqrtRatioX96, liquidity, tickCurrent, tokenIn, tokenOut }: V3PoolInRoute): Pool =>
  new Pool(
    parseToken(tokenIn),
    parseToken(tokenOut),
    parseInt(fee) as FeeAmount,
    sqrtRatioX96,
    liquidity,
    parseInt(tickCurrent)
  )

const genericPoolPairParser = (pool: V3PoolInRoute): Pool => {
  return parsePool(pool)
}

function getRouteProtocol(route: V3PoolInRoute[]): Protocol {
  return Protocol.V3
}
