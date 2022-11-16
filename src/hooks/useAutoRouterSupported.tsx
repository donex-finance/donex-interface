import { useWeb3React } from 'donex-sdk/web3-react/core'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useWeb3React()
  return isSupportedChainId(chainId)
}
