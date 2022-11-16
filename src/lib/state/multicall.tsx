import { createMulticall, ListenerOptions } from 'donex-sdk/redux-multicall'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { useInterfaceMulticall } from 'hooks/useContract'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { combineReducers, createStore } from 'redux'

const multicall = createMulticall()
const reducer = combineReducers({ [multicall.reducerPath]: multicall.reducer })
export const store = createStore(reducer)

export default multicall

export function MulticallUpdater() {
  const { chainId } = useWeb3React()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()
  const listenerOptions: ListenerOptions = {
    blocksPerFetch: 1,
  }

  return (
    <multicall.Updater
      contract={contract}
      chainId={chainId}
      latestBlockNumber={latestBlockNumber}
      listenerOptions={listenerOptions}
    />
  )
}
