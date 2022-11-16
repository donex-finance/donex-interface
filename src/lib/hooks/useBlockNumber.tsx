import { useWeb3React } from 'donex-sdk/web3-react/core'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const MISSING_PROVIDER = Symbol()
const BlockContext = createContext<
  | {
      block_number?: number
      timestamp?: number
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)

function useBlockContext() {
  const blockNumber = useContext(BlockContext)
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }
  return blockNumber
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockContext().block_number
}

export function useBlockTimestamp(): number | undefined {
  return useBlockContext().timestamp
}

export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const { chainId: activeChainId, provider } = useWeb3React()
  const [chainBlock, setChainBlock] = useState<{
    chainId?: number
    block_number?: number
    timestamp?: number
  }>({ chainId: activeChainId })

  const onBlock = useCallback(
    (block_number: number, timestamp: number) => {
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId === activeChainId) {
          if (!chainBlock.block_number || chainBlock.block_number < block_number) {
            return { chainId: activeChainId, block_number, timestamp }
          }
        }
        return chainBlock
      })
    },
    [activeChainId, setChainBlock]
  )

  const windowVisible = useIsWindowVisible()
  useEffect(() => {
    let stale = false

    if (provider && activeChainId && windowVisible) {
      // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
      setChainBlock((chainBlock) => (chainBlock.chainId === activeChainId ? chainBlock : { chainId: activeChainId }))

      const polling = setInterval(() => {
        provider
          .getBlock('latest')
          .then((block) => {
            if (!stale) onBlock(block.block_number, block.timestamp)
          })
          .catch((error) => {
            console.error(`Failed to get block number for chainId ${activeChainId}`, error)
          })
      }, 3000)

      return () => {
        stale = true
        clearInterval(polling)
      }
    }

    return void 0
  }, [activeChainId, provider, onBlock, setChainBlock, windowVisible])

  const value = useMemo(
    () => ({ block_number: chainBlock.block_number, timestamp: chainBlock.timestamp }),
    [chainBlock]
  )
  return <BlockContext.Provider value={value}>{children}</BlockContext.Provider>
}
