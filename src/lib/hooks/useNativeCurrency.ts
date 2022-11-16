import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { Token } from 'donex-sdk/sdk-core'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useMemo } from 'react'

export default function useNativeCurrency(): Token {
  const { chainId } = useWeb3React()
  return useMemo(
    () =>
      chainId
        ? nativeOnChain(chainId)
        : // display mainnet when not connected
          nativeOnChain(SupportedChainId.MAINNET),
    [chainId]
  )
}
