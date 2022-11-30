import { ProviderOptions } from 'starknet'

import { SupportedChainId } from './chains'

/**
 * Known JSON-RPC endpoints.
 * These are the URLs used by the interface when there is not another available source of chain data.
 */
export const RPC_URLS: { [key in SupportedChainId]: ProviderOptions[] } = {
  [SupportedChainId.MAINNET]: [
    {
      sequencer: {
        network: 'mainnet-alpha',
      },
    },
  ],

  [SupportedChainId.TESTNET]: [
  ],
}
