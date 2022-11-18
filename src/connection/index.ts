import { SupportedChainId } from 'constants/chains'
import { initializeConnector, Web3ReactHooks } from 'donex-sdk/web3-react/core'
import { Network } from 'donex-sdk/web3-react/network'
import { StarknetWallet } from 'donex-sdk/web3-react/starknet-wallet'
import { Connector } from 'donex-sdk/web3-react/types'

import { RPC_PROVIDERS } from '../constants/providers'

export enum ConnectionType {
  NETWORK = 'NETWORK',
  ARGENTX_WALLET = 'ARGENTX_WALLET',
  BRAAVOS_WALLET = 'BRAAVOS_WALLET',
}

export interface Connection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
}

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`)
}

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: SupportedChainId.TESTNET })
)
export const networkConnection: Connection = {
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
}

const [argentXWallet, argentXWalletHooks] = initializeConnector<StarknetWallet>(
  (actions) =>
    new StarknetWallet({
      actions,
      options: {
        walletId: 'argentX',
      },
      onError,
    })
)
export const argentXWalletConnection: Connection = {
  connector: argentXWallet,
  hooks: argentXWalletHooks,
  type: ConnectionType.ARGENTX_WALLET,
}

const [braavosWallet, braavosWalletHooks] = initializeConnector<StarknetWallet>(
  (actions) =>
    new StarknetWallet({
      actions,
      options: {
        walletId: 'braavos',
      },
      onError,
    })
)
export const braavosWalletConnection: Connection = {
  connector: braavosWallet,
  hooks: braavosWalletHooks,
  type: ConnectionType.BRAAVOS_WALLET,
}
