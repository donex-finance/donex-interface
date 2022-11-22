import { NFT_POSITION_MANAGER_ABI } from 'abis'
import { intToFelt } from 'donex-sdk/cc-core/utils/utils'
import { fromStarknetCall } from 'donex-sdk/redux-multicall/utils/callUtils'
import { BigintIsh, Currency, CurrencyAmount, Percent, validateAndParseAddress } from 'donex-sdk/sdk-core'
import JSBI from 'jsbi'
import { Contract as Interface } from 'starknet'
import { toBN } from 'starknet/utils/number'
import { bnToUint256 } from 'starknet/utils/uint256'
import invariant from 'tiny-invariant'
import { isAddress } from 'utils'

import { ADDRESS_ZERO } from './constants'
import { Pool } from './entities'
import { Position } from './entities/position'
import { ONE, ZERO } from './internalConstants'
import { Multicall } from './multicall'
import { MethodParameters, toHex } from './utils/calldata'
const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)))

export interface MintSpecificOptions {
  /**
   * The account that should receive the minted NFT.
   */
  recipient: string

  /**
   * Creates pool if not initialized before mint.
   */
  createPool?: boolean
}

export interface IncreaseSpecificOptions {
  /**
   * Indicates the ID of the position to increase liquidity for.
   */
  tokenId: BigintIsh
}

/**
 * Options for producing the calldata to add liquidity.
 */
export interface CommonAddLiquidityOptions {
  /**
   * How much the pool price is allowed to move.
   */
  slippageTolerance: Percent

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  // /**
  //  * Whether to spend ether. If true, one of the pool tokens must be WETH, by default false
  //  */
  // useNative?: NativeCurrency

  // /**
  //  * The optional permit parameters for spending token0
  //  */
  // token0Permit?: PermitOptions

  // /**
  //  * The optional permit parameters for spending token1
  //  */
  // token1Permit?: PermitOptions
}

export type MintOptions = CommonAddLiquidityOptions & MintSpecificOptions
export type IncreaseOptions = CommonAddLiquidityOptions & IncreaseSpecificOptions

export type AddLiquidityOptions = MintOptions | IncreaseOptions

export interface SafeTransferOptions {
  /**
   * The account sending the NFT.
   */
  sender: string

  /**
   * The account that should receive the NFT.
   */
  recipient: string

  /**
   * The id of the token being sent.
   */
  tokenId: BigintIsh
  /**
   * The optional parameter that passes data to the `onERC721Received` call for the staker
   */
  data?: string
}

// type guard
function isMint(options: AddLiquidityOptions): options is MintOptions {
  return Object.keys(options).some((k) => k === 'recipient')
}

export interface CollectOptions {
  /**
   * Indicates the ID of the position to collect for.
   */
  tokenId: BigintIsh

  /**
   * Expected value of tokensOwed0, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed0: CurrencyAmount<Currency>

  /**
   * Expected value of tokensOwed1, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed1: CurrencyAmount<Currency>

  /**
   * The account that should receive the tokens.
   */
  recipient: string
}

export interface NFTPermitOptions {
  v: 0 | 1 | 27 | 28
  r: string
  s: string
  deadline: BigintIsh
  spender: string
}

/**
 * Options for producing the calldata to exit a position.
 */
export interface RemoveLiquidityOptions {
  /**
   * The ID of the token to exit
   */
  tokenId: BigintIsh

  /**
   * The percentage of position liquidity to exit.
   */
  liquidityPercentage: Percent

  /**
   * How much the pool price is allowed to move.
   */
  slippageTolerance: Percent

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * Whether the NFT should be burned if the entire position is being exited, by default false.
   */
  burnToken?: boolean

  /**
   * The optional permit of the token ID being exited, in case the exit transaction is being sent by an account that does not own the NFT
   */
  permit?: NFTPermitOptions

  /**
   * Parameters to be passed on to collect
   */
  collectOptions: Omit<CollectOptions, 'tokenId'>
}

export abstract class NonfungiblePositionManager {
  public static INTERFACE: Interface = new Interface(NFT_POSITION_MANAGER_ABI, '')

  private static encodeCreate(pool: Pool): string {
    return fromStarknetCall(
      NonfungiblePositionManager.INTERFACE.populate('create_and_initialize_pool', [
        pool.token0.address,
        pool.token1.address,
        pool.fee,
        bnToUint256(pool.sqrtRatioX96.toString()),
      ])
    ).callData
  }

  public static createCallParameters(pool: Pool): MethodParameters {
    return {
      calldata: this.encodeCreate(pool),
      value: toHex(0),
    }
  }

  public static addCallParameters(position: Position, options: AddLiquidityOptions): MethodParameters {
    invariant(JSBI.greaterThan(position.liquidity, ZERO), 'ZERO_LIQUIDITY')

    const calldatas: string[] = []

    // get amounts
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)
    const amount0Min = minimumAmounts.amount0
    const amount1Min = minimumAmounts.amount1

    const deadline = options.deadline

    // create pool if needed
    if (isMint(options) && options.createPool) {
      calldatas.push(this.encodeCreate(position.pool))
    }

    // mint
    if (isMint(options)) {
      const recipient: string = validateAndParseAddress(options.recipient)

      calldatas.push(
        fromStarknetCall(
          NonfungiblePositionManager.INTERFACE.populate('mint', [
            recipient,
            position.pool.token0.address,
            position.pool.token1.address,
            position.pool.fee.toString(),
            intToFelt(position.tickLower.toString()),
            intToFelt(position.tickUpper.toString()),
            bnToUint256(amount0Desired.toString()),
            bnToUint256(amount1Desired.toString()),
            bnToUint256(amount0Min.toString()),
            bnToUint256(amount1Min.toString()),
            deadline.toString(),
          ])
        ).callData
      )
    } else {
      // increase
      calldatas.push(
        fromStarknetCall(
          NonfungiblePositionManager.INTERFACE.populate('increase_liquidity', [
            bnToUint256(options.tokenId.toString()),
            bnToUint256(amount0Desired.toString()),
            bnToUint256(amount1Desired.toString()),
            bnToUint256(amount0Min.toString()),
            bnToUint256(amount1Min.toString()),
            deadline.toString(),
          ])
        ).callData
      )
    }

    // if (options.useNative) {
    //   const wrapped = options.useNative.wrapped
    //   invariant(position.pool.token0.equals(wrapped) || position.pool.token1.equals(wrapped), 'NO_WETH')

    //   const wrappedValue = position.pool.token0.equals(wrapped) ? amount0Desired : amount1Desired

    //   // we only need to refund if we're actually sending ETH
    //   if (JSBI.greaterThan(wrappedValue, ZERO)) {
    //     calldatas.push(Payments.encodeRefundETH())
    //   }

    //   value = toHex(wrappedValue)
    // }

    return Multicall.encodeMethodParameters(calldatas)
  }

  private static encodeCollect(options: CollectOptions): string[] {
    const calldatas: string[] = []

    const tokenId = options.tokenId

    const involvesETH =
      options.expectedCurrencyOwed0.currency.isNative || options.expectedCurrencyOwed1.currency.isNative

    const recipient = isAddress(options.recipient)

    // collect
    calldatas.push(
      fromStarknetCall(
        NonfungiblePositionManager.INTERFACE.populate('collect', [
          bnToUint256(tokenId.toString()),
          involvesETH ? ADDRESS_ZERO : recipient,
          MaxUint128,
          MaxUint128,
        ])
      ).callData
    )

    // if (involvesETH) {
    //   const ethAmount = options.expectedCurrencyOwed0.currency.isNative
    //     ? options.expectedCurrencyOwed0.quotient
    //     : options.expectedCurrencyOwed1.quotient
    //   const token = options.expectedCurrencyOwed0.currency.isNative
    //     ? (options.expectedCurrencyOwed1.currency as Token)
    //     : (options.expectedCurrencyOwed0.currency as Token)
    //   const tokenAmount = options.expectedCurrencyOwed0.currency.isNative
    //     ? options.expectedCurrencyOwed1.quotient
    //     : options.expectedCurrencyOwed0.quotient

    //   calldatas.push(Payments.encodeUnwrapWETH9(ethAmount, recipient))
    //   calldatas.push(Payments.encodeSweepToken(token, tokenAmount, recipient))
    // }

    return calldatas
  }

  public static collectCallParameters(options: CollectOptions): MethodParameters {
    const calldatas: string[] = NonfungiblePositionManager.encodeCollect(options)

    return Multicall.encodeMethodParameters(calldatas)
  }

  /**
   * Produces the calldata for completely or partially exiting a position
   * @param position The position to exit
   * @param options Additional information necessary for generating the calldata
   * @returns The call parameters
   */
  public static removeCallParameters(position: Position, options: RemoveLiquidityOptions): MethodParameters {
    const calldatas: string[] = []

    const deadline = toHex(options.deadline)
    const tokenId = toHex(options.tokenId)

    // construct a partial position with a percentage of liquidity
    const partialPosition = new Position({
      pool: position.pool,
      liquidity: options.liquidityPercentage.multiply(position.liquidity).quotient,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    })
    invariant(JSBI.greaterThan(partialPosition.liquidity, ZERO), 'ZERO_LIQUIDITY')

    // slippage-adjusted underlying amounts
    const { amount0: amount0Min, amount1: amount1Min } = partialPosition.burnAmountsWithSlippage(
      options.slippageTolerance
    )

    // remove liquidity
    calldatas.push(
      fromStarknetCall(
        NonfungiblePositionManager.INTERFACE.populate('decrease_liquidity', [
          bnToUint256(tokenId),
          toBN(partialPosition.liquidity.toString()),
          bnToUint256(amount0Min.toString()),
          bnToUint256(amount1Min.toString()),
          deadline.toString(),
        ])
      ).callData
    )

    const { expectedCurrencyOwed0, expectedCurrencyOwed1, ...rest } = options.collectOptions
    calldatas.push(
      ...NonfungiblePositionManager.encodeCollect({
        tokenId: toHex(options.tokenId),
        // add the underlying value to the expected currency already owed
        expectedCurrencyOwed0: expectedCurrencyOwed0.add(
          CurrencyAmount.fromRawAmount(expectedCurrencyOwed0.currency, amount0Min)
        ),
        expectedCurrencyOwed1: expectedCurrencyOwed1.add(
          CurrencyAmount.fromRawAmount(expectedCurrencyOwed1.currency, amount1Min)
        ),
        ...rest,
      })
    )

    if (options.liquidityPercentage.equalTo(ONE)) {
      if (options.burnToken) {
        calldatas.push(
          fromStarknetCall(NonfungiblePositionManager.INTERFACE.populate('burn', [bnToUint256(tokenId)])).callData
        )
      }
    } else {
      invariant(options.burnToken !== true, 'CANNOT_BURN')
    }
    return Multicall.encodeMethodParameters(calldatas)
  }

  public static safeTransferFromParameters(options: SafeTransferOptions): MethodParameters {
    const recipient = validateAndParseAddress(options.recipient)
    const sender = validateAndParseAddress(options.sender)

    let calldata: string
    if (options.data) {
      calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData(
        'safeTransferFrom(address,address,uint256,bytes)',
        [sender, recipient, toHex(options.tokenId), options.data]
      )
    } else {
      calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('safeTransferFrom(address,address,uint256)', [
        sender,
        recipient,
        toHex(options.tokenId),
      ])
    }

    return Multicall.encodeMethodParameters(calldata)
  }
}
