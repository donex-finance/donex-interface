import { Provider, ProviderOptions } from 'starknet'

import { SupportedChainId } from './chains'
import { RPC_URLS } from './networks'

class AppJsonRpcProvider extends Provider {
  private _blockCache = new Map<string, Promise<any>>()
  get blockCache() {
    // If the blockCache has not yet been initialized this block, do so by
    // setting a listener to clear it on the next block.

    return this._blockCache
  }

  constructor(urls: ProviderOptions[]) {
    super(urls[0])
  }

  async send(method: string, params: Array<any>): Promise<any> {
    console.log('send')
  }
}

/**
 * These are the only JsonRpcProviders used directly by the interface.
 */
export const RPC_PROVIDERS: { [key in SupportedChainId]: Provider } = {
  [SupportedChainId.MAINNET]: new AppJsonRpcProvider(RPC_URLS[SupportedChainId.MAINNET]),
  [SupportedChainId.TESTNET]: new AppJsonRpcProvider(RPC_URLS[SupportedChainId.TESTNET]),
}
