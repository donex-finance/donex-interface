/* eslint-disable simple-import-sort/imports */
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { chainIdToBackendName } from 'graphql/data/util'
import { Chain } from 'graphql/data/__generated__/TopTokens100Query.graphql'
import { useEffect, useRef } from 'react'

export const useOnGlobalChainSwitch = (callback: (chain: Chain) => void) => {
  const { chainId: connectedChainId } = useWeb3React()
  const globalChainName = chainIdToBackendName(connectedChainId)
  const prevGlobalChainRef = useRef(globalChainName)
  useEffect(() => {
    if (prevGlobalChainRef.current !== globalChainName) {
      callback(globalChainName)
    }
    prevGlobalChainRef.current = globalChainName
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalChainName])
}
