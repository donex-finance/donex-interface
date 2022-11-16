export interface EthereumProvider {
  on?: (...args: any[]) => void
  removeListener?: (...args: any[]) => void
  autoRefreshOnNetworkChange?: boolean
}

export interface ArgentXProvider {
  id: string
  isConnected: number
  name: string
  version: string
  icon: string
}

export interface BraavosProvider {
  id: string
  isConnected: number
  name: string
  version: string
  icon: string
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
    starknet_argentX?: ArgentXProvider
    starknet_braavos?: BraavosProvider
  }
}
