import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { toStarknetCall } from 'donex-sdk/redux-multicall/utils/callUtils'
import { Trade } from 'donex-sdk/router-sdk'
import { Currency, TradeType } from 'donex-sdk/sdk-core'
import { useMemo } from 'react'
import { AccountInterface, InvokeFunctionResponse, ProviderInterface } from 'starknet'
import { swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

interface SwapCall {
  address: string
  calldata: string
  value: string
}

interface SwapCallEstimate {
  call: SwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall
  error: Error
}

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction(
  account: string | null | undefined,
  chainId: number | undefined,
  provider: ProviderInterface | undefined,
  trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  swapCalls: SwapCall[]
): { callback: null | (() => Promise<InvokeFunctionResponse>) } {
  return useMemo(() => {
    if (!trade || !provider || !account || !chainId) {
      return { callback: null }
    }
    return {
      callback: async function onSwap(): Promise<InvokeFunctionResponse> {
        // const estimatedCalls: SwapCallEstimate[] = await Promise.all(
        //   swapCalls.map((call) => {
        //     const { address, calldata, value } = call

        //     const tx = toStarknetCall({
        //       address,
        //       callData: calldata,
        //     })
        //     return provider
        //       .getInvokeEstimateFee(tx, { nonce: 1 }, 1)
        //       .then((gasEstimate) => {
        //         return {
        //           call,
        //           gasEstimate,
        //         }
        //       })
        //       .catch((gasError) => {
        //         console.debug('Gas estimate failed, trying eth_call to extract error', call)

        //         return provider
        //           .callContract(tx)
        //           .then((result) => {
        //             console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
        //             return { call, error: <Trans>Unexpected issue with estimating the gas. Please try again.</Trans> }
        //           })
        //           .catch((callError) => {
        //             console.debug('Call threw error', call, callError)
        //             return { call, error: swapErrorToUserReadableMessage(callError) }
        //           })
        //       })
        //   })
        // )

        // // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        // let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
        //   (el, ix, list): el is SuccessfulCall =>
        //     'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        // )

        // // check if any calls errored with a recognizable error
        // if (!bestCallOption) {
        //   const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
        //   if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        //   const firstNoErrorCall = estimatedCalls.find<SwapCallEstimate>(
        //     (call): call is SwapCallEstimate => !('error' in call)
        //   )
        //   if (!firstNoErrorCall) throw new Error(t`Unexpected error. Could not estimate gas for the swap.`)
        //   bestCallOption = firstNoErrorCall
        // }

        // const {
        //   call: { address, calldata, value },
        // } = bestCallOption
        const { address, calldata, value } = swapCalls[0]

        const tx = toStarknetCall({
          address,
          callData: calldata,
        })

        return ((provider as any).provider as AccountInterface)
          .execute(tx)
          .then((response) => {
            return response
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error(t`Transaction rejected`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, address, calldata, value)

              throw new Error(t`Swap failed: ${swapErrorToUserReadableMessage(error)}`)
            }
          })
      },
    }
  }, [account, chainId, provider, swapCalls, trade])
}
