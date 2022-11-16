import { BigNumber } from '@ethersproject/bignumber'
import { SWAP_ROUTER_ADDRESSES } from 'constants/addresses'
import { SwapRouter, Trade } from 'donex-sdk/router-sdk'
import { Currency, Percent, TradeType } from 'donex-sdk/sdk-core'
import { FeeOptions } from 'donex-sdk/v3-sdk'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useMemo } from 'react'

import useENS from './useENS'

interface SwapCall {
  address: string
  calldata: string
  value: string
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 */
export function useSwapCallArguments(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  recipientAddressOrName: string | null | undefined,
  deadline: BigNumber | undefined,
  feeOptions: FeeOptions | undefined
): SwapCall[] {
  const { account, chainId, provider } = useWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !recipient || !provider || !account || !chainId || !deadline) return []

    const swapRouterAddress = chainId ? SWAP_ROUTER_ADDRESSES[chainId] : undefined
    if (!swapRouterAddress) return []

    const { value, calldata } = SwapRouter.swapCallParameters(trade, {
      fee: feeOptions,
      recipient,
      slippageTolerance: allowedSlippage,
      deadlineOrPreviousBlockhash: deadline.toString(),
    })

    return [
      {
        address: swapRouterAddress,
        calldata,
        value,
      },
    ]
  }, [account, allowedSlippage, chainId, deadline, feeOptions, provider, recipient, trade])
}
