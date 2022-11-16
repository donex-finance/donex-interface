import { argentXWalletConnection, braavosWalletConnection, ConnectionType, networkConnection } from 'connection'
import { Connector } from 'donex-sdk/web3-react/types'

export function getIsInjected(): boolean {
  return Boolean(window.ethereum)
}

export function getIsArgentX(): boolean {
  return window.starknet_argentX ? true : false
}

export function getIsBraavos(): boolean {
  return window.starknet_braavos ? true : false
}

const CONNECTIONS = [argentXWalletConnection, braavosWalletConnection, networkConnection]
export function getConnection(c: Connector | ConnectionType) {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      case ConnectionType.ARGENTX_WALLET:
        return argentXWalletConnection
      case ConnectionType.BRAAVOS_WALLET:
        return braavosWalletConnection
      case ConnectionType.NETWORK:
        return networkConnection
    }
  }
}

export function getConnectionName(connectionType: ConnectionType) {
  switch (connectionType) {
    case ConnectionType.ARGENTX_WALLET:
      return 'ArgentX Wallet'
    case ConnectionType.BRAAVOS_WALLET:
      return 'Braavos Wallet'
    case ConnectionType.NETWORK:
      return 'Network'
  }
}
