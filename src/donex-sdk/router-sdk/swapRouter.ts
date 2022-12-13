import { SWAP_ROUTER_ABI } from 'abis'
import { fromStarknetCall } from 'donex-sdk/redux-multicall/utils/callUtils'
import { Currency, CurrencyAmount, Percent, TradeType, validateAndParseAddress } from 'donex-sdk/sdk-core'
import {
  encodeRouteToPath,
  FeeOptions,
  MethodParameters,
  Multicall,
  Position,
  Trade as V3Trade,
} from 'donex-sdk/v3-sdk'
import JSBI from 'jsbi'
import { Contract as Interface } from 'starknet'
import { bnToUint256 } from 'starknet/utils/uint256'
import invariant from 'tiny-invariant'

import { ADDRESS_THIS, MSG_SENDER } from './constants'
import { Protocol } from './entities/protocol'
import { RouteV3 } from './entities/route'
import { Trade } from './entities/trade'
import { Validation } from './multicallExtended'

const ZERO = JSBI.BigInt(0)
const REFUND_ETH_PRICE_IMPACT_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(100))

/**
 * Options for producing the arguments to send calls to the router.
 */
export interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent

  /**
   * The account that should receive the output. If omitted, output is sent to msg.sender.
   */
  recipient?: string

  /**
   * Either deadline (when the transaction expires, in epoch seconds), or previousBlockhash.
   */
  deadlineOrPreviousBlockhash?: Validation

  /**
   * Optional information for taking a fee on output.
   */
  fee?: FeeOptions
}

type AnyTradeType =
  | Trade<Currency, Currency, TradeType>
  | V3Trade<Currency, Currency, TradeType>
  | V3Trade<Currency, Currency, TradeType>[]

/**
 * Represents the Donex V2 + V3 SwapRouter02, and has static methods for helping execute trades.
 */
export abstract class SwapRouter {
  public static INTERFACE: Interface = new Interface(SWAP_ROUTER_ABI, '')

  /**
   * Cannot be constructed.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * @notice Generates the calldata for a Swap with a V3 Route.
   * @param trade The V3Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @param routerMustCustody Flag for whether funds should be sent to the router
   * @param performAggregatedSlippageCheck Flag for whether we want to perform an aggregated slippage check
   * @returns A string array of calldatas for the trade.
   */
  private static encodeV3Swap(
    trade: V3Trade<Currency, Currency, TradeType>,
    options: SwapOptions,
    routerMustCustody: boolean,
    performAggregatedSlippageCheck: boolean
  ): string[] {
    const calldatas: string[] = []
    const deadline = Math.floor(Date.now() / 1000) + 3600
    for (const { route, inputAmount, outputAmount } of trade.swaps) {
      const amountIn = trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient
      const amountOut = trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient

      // flag for whether the trade is single hop or not
      const singleHop = route.pools.length === 1

      const recipient = routerMustCustody
        ? ADDRESS_THIS
        : typeof options.recipient === 'undefined'
        ? MSG_SENDER
        : validateAndParseAddress(options.recipient)

      if (singleHop) {
        if (trade.tradeType === TradeType.EXACT_INPUT) {
          const exactInputSingleParams = {
            tokenIn: route.tokenPath[0].address,
            tokenOut: route.tokenPath[1].address,
            fee: route.pools[0].fee,
            recipient,
            amountIn,
            amountOutMinimum: performAggregatedSlippageCheck ? 0 : amountOut,
            sqrtPriceLimitX96: 0,
          }

          calldatas.push(
            fromStarknetCall(
              SwapRouter.INTERFACE.populate('exact_input', [
                exactInputSingleParams.tokenIn,
                exactInputSingleParams.tokenOut,
                exactInputSingleParams.fee.toString(),
                exactInputSingleParams.recipient,
                bnToUint256(exactInputSingleParams.amountIn.toString()),
                bnToUint256(exactInputSingleParams.sqrtPriceLimitX96.toString()),
                bnToUint256(exactInputSingleParams.amountOutMinimum.toString()),
                deadline.toString(),
              ])
            ).callData
          )
        } else {
          const exactOutputSingleParams = {
            tokenIn: route.tokenPath[0].address,
            tokenOut: route.tokenPath[1].address,
            fee: route.pools[0].fee,
            recipient,
            amountOut,
            amountInMaximum: amountIn,
            sqrtPriceLimitX96: 0,
          }

          calldatas.push(
            fromStarknetCall(
              SwapRouter.INTERFACE.populate('exact_output', [
                exactOutputSingleParams.tokenIn,
                exactOutputSingleParams.tokenOut,
                exactOutputSingleParams.fee.toString(),
                exactOutputSingleParams.recipient,
                bnToUint256(exactOutputSingleParams.amountOut.toString()),
                bnToUint256(exactOutputSingleParams.sqrtPriceLimitX96.toString()),
                bnToUint256(exactOutputSingleParams.amountInMaximum.toString()),
                deadline.toString(),
              ])
            ).callData
          )
        }
      } else {
        const path: string[] = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT)

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          const exactInputParams = {
            path,
            recipient,
            amountIn,
            amountOutMinimum: performAggregatedSlippageCheck ? 0 : amountOut,
          }

          calldatas.push(
            fromStarknetCall(
              SwapRouter.INTERFACE.populate('exact_input_router', [
                exactInputParams.path,
                exactInputParams.recipient,
                bnToUint256(exactInputParams.amountIn.toString()),
                bnToUint256(exactInputParams.amountOutMinimum.toString()),
                deadline.toString(),
              ])
            ).callData
          )
        } else {
          const exactOutputParams = {
            path,
            recipient,
            amountOut,
            amountInMaximum: amountIn,
          }

          calldatas.push(
            fromStarknetCall(
              SwapRouter.INTERFACE.populate('exact_output_router', [
                exactOutputParams.path,
                exactOutputParams.recipient,
                bnToUint256(exactOutputParams.amountOut.toString()),
                bnToUint256(exactOutputParams.amountInMaximum.toString()),
                deadline.toString(),
              ])
            ).callData
          )
        }
      }
    }

    return calldatas
  }

  private static encodeSwaps(
    trades: AnyTradeType,
    options: SwapOptions,
    isSwapAndAdd?: boolean
  ): {
    calldatas: string[]
    sampleTrade: V3Trade<Currency, Currency, TradeType>
    routerMustCustody: boolean
    inputIsNative: boolean
    outputIsNative: boolean
    totalAmountIn: CurrencyAmount<Currency>
    minimumAmountOut: CurrencyAmount<Currency>
    quoteAmountOut: CurrencyAmount<Currency>
  } {
    // If dealing with an instance of the aggregated Trade object, unbundle it to individual trade objects.
    if (trades instanceof Trade) {
      invariant(
        trades.swaps.every((swap) => swap.route.protocol == Protocol.V3),
        'UNSUPPORTED_PROTOCOL'
      )

      const individualTrades: V3Trade<Currency, Currency, TradeType>[] = []

      for (const { route, inputAmount, outputAmount } of trades.swaps) {
        if (route.protocol === Protocol.V3) {
          individualTrades.push(
            V3Trade.createUncheckedTrade({
              route: route as RouteV3<Currency, Currency>,
              inputAmount,
              outputAmount,
              tradeType: trades.tradeType,
            })
          )
        } else {
          throw new Error('UNSUPPORTED_TRADE_PROTOCOL')
        }
      }
      trades = individualTrades
    }

    if (!Array.isArray(trades)) {
      trades = [trades]
    }

    const numberOfTrades = trades.reduce(
      (numberOfTrades, trade) => numberOfTrades + (trade instanceof V3Trade ? trade.swaps.length : 1),
      0
    )

    const sampleTrade = trades[0]

    // All trades should have the same starting/ending currency and trade type
    invariant(
      trades.every((trade) => trade.inputAmount.currency.equals(sampleTrade.inputAmount.currency)),
      'TOKEN_IN_DIFF'
    )
    invariant(
      trades.every((trade) => trade.outputAmount.currency.equals(sampleTrade.outputAmount.currency)),
      'TOKEN_OUT_DIFF'
    )
    invariant(
      trades.every((trade) => trade.tradeType === sampleTrade.tradeType),
      'TRADE_TYPE_DIFF'
    )

    const calldatas: string[] = []

    const inputIsNative = sampleTrade.inputAmount.currency.isNative
    const outputIsNative = sampleTrade.outputAmount.currency.isNative

    // flag for whether we want to perform an aggregated slippage check
    //   1. when there are >2 exact input trades. this is only a heuristic,
    //      as it's still more gas-expensive even in this case, but has benefits
    //      in that the reversion probability is lower
    const performAggregatedSlippageCheck = sampleTrade.tradeType === TradeType.EXACT_INPUT && numberOfTrades > 2
    // flag for whether funds should be send first to the router
    //   1. when receiving ETH (which much be unwrapped from WETH)
    //   2. when a fee on the output is being taken
    //   3. when performing swap and add
    //   4. when performing an aggregated slippage check
    const routerMustCustody = outputIsNative || !!options.fee || !!isSwapAndAdd || performAggregatedSlippageCheck

    for (const trade of trades) {
      if (trade instanceof V3Trade) {
        for (const calldata of SwapRouter.encodeV3Swap(
          trade,
          options,
          routerMustCustody,
          performAggregatedSlippageCheck
        )) {
          calldatas.push(calldata)
        }
      } else {
        throw new Error('Unsupported trade object')
      }
    }

    const ZERO_IN: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(sampleTrade.inputAmount.currency, 0)
    const ZERO_OUT: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(sampleTrade.outputAmount.currency, 0)

    const minimumAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(trade.minimumAmountOut(options.slippageTolerance)),
      ZERO_OUT
    )

    const quoteAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(trade.outputAmount),
      ZERO_OUT
    )

    const totalAmountIn: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(trade.maximumAmountIn(options.slippageTolerance)),
      ZERO_IN
    )

    return {
      calldatas,
      sampleTrade,
      routerMustCustody,
      inputIsNative,
      outputIsNative,
      totalAmountIn,
      minimumAmountOut,
      quoteAmountOut,
    }
  }

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trades to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(
    trades:
      | Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>[],
    options: SwapOptions
  ): MethodParameters {
    const {
      calldatas,
      sampleTrade,
      routerMustCustody,
      inputIsNative,
      outputIsNative,
      totalAmountIn,
      minimumAmountOut,
    } = SwapRouter.encodeSwaps(trades, options)

    // // must refund when paying in ETH: either with an uncertain input amount OR if there's a chance of a partial fill.
    // // unlike ERC20's, the full ETH value must be sent in the transaction, so the rest must be refunded.
    // if (inputIsNative && (sampleTrade.tradeType === TradeType.EXACT_OUTPUT || SwapRouter.riskOfPartialFill(trades))) {
    //   calldatas.push(Payments.encodeRefundETH())
    // }

    return Multicall.encodeMethodParameters(calldatas)
    // return {
    //   calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
    //   value: toHex(inputIsNative ? totalAmountIn.quotient : ZERO),
    // }
  }

  // /**
  //  * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
  //  * @param trades to produce call parameters for
  //  * @param options options for the call parameters
  //  */
  // public static swapAndAddCallParameters(
  //   trades: AnyTradeType,
  //   options: SwapAndAddOptions,
  //   position: Position,
  //   addLiquidityOptions: CondensedAddLiquidityOptions,
  //   tokenInApprovalType: ApprovalTypes,
  //   tokenOutApprovalType: ApprovalTypes
  // ): MethodParameters {
  //   const {
  //     calldatas,
  //     inputIsNative,
  //     outputIsNative,
  //     sampleTrade,
  //     totalAmountIn: totalAmountSwapped,
  //     quoteAmountOut,
  //     minimumAmountOut,
  //   } = SwapRouter.encodeSwaps(trades, options, true)

  //   // // encode output token permit if necessary
  //   // if (options.outputTokenPermit) {
  //   //   invariant(quoteAmountOut.currency.isToken, 'NON_TOKEN_PERMIT_OUTPUT')
  //   //   calldatas.push(SelfPermit.encodePermit(quoteAmountOut.currency, options.outputTokenPermit))
  //   // }

  //   const chainId = sampleTrade.route.chainId
  //   const zeroForOne = position.pool.token0.wrapped.address === totalAmountSwapped.currency.wrapped.address
  //   const { positionAmountIn, positionAmountOut } = SwapRouter.getPositionAmounts(position, zeroForOne)

  //   // if tokens are native they will be converted to WETH9
  //   const tokenIn = inputIsNative ? WETH9[chainId] : positionAmountIn.currency.wrapped
  //   const tokenOut = outputIsNative ? WETH9[chainId] : positionAmountOut.currency.wrapped

  //   // if swap output does not make up whole outputTokenBalanceDesired, pull in remaining tokens for adding liquidity
  //   const amountOutRemaining = positionAmountOut.subtract(quoteAmountOut.wrapped)
  //   if (amountOutRemaining.greaterThan(CurrencyAmount.fromRawAmount(positionAmountOut.currency, 0))) {
  //     // if output is native, this means the remaining portion is included as native value in the transaction
  //     // and must be wrapped. Otherwise, pull in remaining ERC20 token.
  //     outputIsNative
  //       ? calldatas.push(PaymentsExtended.encodeWrapETH(amountOutRemaining.quotient))
  //       : calldatas.push(PaymentsExtended.encodePull(tokenOut, amountOutRemaining.quotient))
  //   }

  //   // if input is native, convert to WETH9, else pull ERC20 token
  //   inputIsNative
  //     ? calldatas.push(PaymentsExtended.encodeWrapETH(positionAmountIn.quotient))
  //     : calldatas.push(PaymentsExtended.encodePull(tokenIn, positionAmountIn.quotient))

  //   // approve token balances to NFTManager
  //   if (tokenInApprovalType !== ApprovalTypes.NOT_REQUIRED)
  //     calldatas.push(ApproveAndCall.encodeApprove(tokenIn, tokenInApprovalType))
  //   if (tokenOutApprovalType !== ApprovalTypes.NOT_REQUIRED)
  //     calldatas.push(ApproveAndCall.encodeApprove(tokenOut, tokenOutApprovalType))

  //   // represents a position with token amounts resulting from a swap with maximum slippage
  //   // hence the minimal amount out possible.
  //   const minimalPosition = Position.fromAmounts({
  //     pool: position.pool,
  //     tickLower: position.tickLower,
  //     tickUpper: position.tickUpper,
  //     amount0: zeroForOne ? position.amount0.quotient.toString() : minimumAmountOut.quotient.toString(),
  //     amount1: zeroForOne ? minimumAmountOut.quotient.toString() : position.amount1.quotient.toString(),
  //     useFullPrecision: false,
  //   })

  //   // encode NFTManager add liquidity
  //   calldatas.push(
  //     ApproveAndCall.encodeAddLiquidity(position, minimalPosition, addLiquidityOptions, options.slippageTolerance)
  //   )

  //   // sweep remaining tokens
  //   inputIsNative
  //     ? calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
  //     : calldatas.push(PaymentsExtended.encodeSweepToken(tokenIn, ZERO))
  //   outputIsNative
  //     ? calldatas.push(PaymentsExtended.encodeUnwrapWETH9(ZERO))
  //     : calldatas.push(PaymentsExtended.encodeSweepToken(tokenOut, ZERO))

  //   let value: JSBI
  //   if (inputIsNative) {
  //     value = totalAmountSwapped.wrapped.add(positionAmountIn.wrapped).quotient
  //   } else if (outputIsNative) {
  //     value = amountOutRemaining.quotient
  //   } else {
  //     value = ZERO
  //   }

  //   return {
  //     calldata: MulticallExtended.encodeMulticall(calldatas, options.deadlineOrPreviousBlockhash),
  //     value: value.toString(),
  //   }
  // }

  // if price impact is very high, there's a chance of hitting max/min prices resulting in a partial fill of the swap
  private static riskOfPartialFill(trades: AnyTradeType): boolean {
    if (Array.isArray(trades)) {
      return trades.some((trade) => {
        return SwapRouter.v3TradeWithHighPriceImpact(trade)
      })
    } else {
      return SwapRouter.v3TradeWithHighPriceImpact(trades)
    }
  }

  private static v3TradeWithHighPriceImpact(
    trade: Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  ): boolean {
    return trade.priceImpact.greaterThan(REFUND_ETH_PRICE_IMPACT_THRESHOLD)
  }

  private static getPositionAmounts(
    position: Position,
    zeroForOne: boolean
  ): {
    positionAmountIn: CurrencyAmount<Currency>
    positionAmountOut: CurrencyAmount<Currency>
  } {
    const { amount0, amount1 } = position.mintAmounts
    const currencyAmount0 = CurrencyAmount.fromRawAmount(position.pool.token0, amount0)
    const currencyAmount1 = CurrencyAmount.fromRawAmount(position.pool.token1, amount1)

    const [positionAmountIn, positionAmountOut] = zeroForOne
      ? [currencyAmount0, currencyAmount1]
      : [currencyAmount1, currencyAmount0]
    return { positionAmountIn, positionAmountOut }
  }
}
