import { argentXWalletConnection, braavosWalletConnection, networkConnection } from 'connection'
import { getChainInfo } from 'constants/chainInfo'
import { isSupportedChain, SupportedChainId } from 'constants/chains'
import { RPC_URLS } from 'constants/networks'
import { Connector } from 'donex-sdk/web3-react/types'
import { ProviderOptions } from 'starknet'

function getRpcUrl(chainId: SupportedChainId): ProviderOptions {
  return RPC_URLS[chainId][0]
}

export const switchChain = async (connector: Connector, chainId: SupportedChainId) => {
  if (!isSupportedChain(chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  } else if (
    connector === argentXWalletConnection.connector ||
    connector === braavosWalletConnection.connector ||
    connector === networkConnection.connector
  ) {
    await connector.activate(chainId)
  } else {
    const info = getChainInfo(chainId)
    const addChainParameter = {
      chainId,
      chainName: info.label,
      rpcUrls: [getRpcUrl(chainId)],
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: [info.explorer],
    }
    await connector.activate(addChainParameter)
  }
}
