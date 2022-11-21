import { NFT_POSITION_MANAGER_ABI } from 'abis'
import { fromStarknetCall } from 'donex-sdk/redux-multicall/utils/callUtils'
import { BigintIsh, Currency, CurrencyAmount, TradeType } from 'donex-sdk/sdk-core'
import { Contract as Interface } from 'starknet'
import { bnToUint256 } from 'starknet/utils/uint256'
import invariant from 'tiny-invariant'

import { FeeAmount } from './constants'
import { Route } from './entities'
import { encodeRouteToPath, MethodParameters, toHex } from './utils'

/**
 * Optional arguments to send to the quoter.
 */
export interface QuoteOptions {
  /**
   * The optional price limit for the trade.
   */
  sqrtPriceLimitX96?: BigintIsh

  /**
   * The optional quoter interface to use
   */
  useQuoterV2?: boolean
}

interface BaseQuoteParams {
  fee: FeeAmount
  sqrtPriceLimitX96: string
  tokenIn: string
  tokenOut: string
}

/**
 * Represents the Donex QuoterV1 contract with a method for returning the formatted
 * calldata needed to call the quoter contract.
 */
export abstract class SwapQuoter {
  public static V1INTERFACE: Interface = new Interface(NFT_POSITION_MANAGER_ABI, '')

  /**
   * Produces the on-chain method name of the appropriate function within QuoterV2,
   * and the relevant hex encoded parameters.
   * @template TInput The input token, either Ether or an ERC-20
   * @template TOutput The output token, either Ether or an ERC-20
   * @param route The swap route, a list of pools through which a swap can occur
   * @param amount The amount of the quote, either an amount in, or an amount out
   * @param tradeType The trade type, either exact input or exact output
   * @param options The optional params including price limit and Quoter contract switch
   * @returns The formatted calldata
   */
  public static quoteCallParameters<TInput extends Currency, TOutput extends Currency>(
    route: Route<TInput, TOutput>,
    amount: CurrencyAmount<TInput | TOutput>,
    tradeType: TradeType,
    options: QuoteOptions = {}
  ): MethodParameters {
    const singleHop = route.pools.length === 1
    const quoteAmount = amount.quotient
    let calldata: string
    const swapInterface: Interface = this.V1INTERFACE

    if (singleHop) {
      const baseQuoteParams: BaseQuoteParams = {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: route.pools[0].fee,
        sqrtPriceLimitX96: toHex(options?.sqrtPriceLimitX96 ?? 0),
      }
      const v1QuoteParams = [
        baseQuoteParams.tokenIn,
        baseQuoteParams.tokenOut,
        baseQuoteParams.fee.toString(),
        bnToUint256(quoteAmount.toString()),
      ]
      const tradeTypeFunctionName = tradeType === TradeType.EXACT_INPUT ? 'get_exact_input' : 'get_exact_output'
      calldata = fromStarknetCall(swapInterface.populate(tradeTypeFunctionName, v1QuoteParams)).callData
    } else {
      invariant(options?.sqrtPriceLimitX96 === undefined, 'MULTIHOP_PRICE_LIMIT')
      const path: string[] = encodeRouteToPath(route, tradeType === TradeType.EXACT_OUTPUT)
      const tradeTypeFunctionName =
        tradeType === TradeType.EXACT_INPUT ? 'get_exact_input_router' : 'get_exact_output_router'
      calldata = fromStarknetCall(
        swapInterface.populate(tradeTypeFunctionName, [path, bnToUint256(quoteAmount.toString())])
      ).callData
    }
    return {
      calldata,
      value: toHex(0),
    }
  }
}
