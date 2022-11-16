import type { Actions, AddEthereumChainParameter, WatchAssetParameters } from 'donex-sdk/web3-react/types'
import { Connector } from 'donex-sdk/web3-react/types'
import getStarknet from 'get-starknet'
import { AccountInterface } from 'starknet'

import { fromStarknetChainId } from '../network'
export class NoStarknetWalletError extends Error {
  public constructor() {
    super('StarknetWallet not installed')
    this.name = NoStarknetWalletError.name
    Object.setPrototypeOf(this, NoStarknetWalletError.prototype)
  }
}

export interface StarknetWalletConstructorArgs {
  actions: Actions
  onError?: (error: Error) => void
}

export class StarknetWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: AccountInterface
  public customProvider?: AccountInterface
  public starknetWindowObject?: getStarknet.IStarknetWindowObject

  private eagerConnection?: Promise<void>

  constructor({ actions, onError }: StarknetWalletConstructorArgs) {
    super(actions, onError)
  }

  private listenEvents() {
    if (this.starknetWindowObject) {
      console.log('listenEvents')
      this.starknetWindowObject.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      })
      this.starknetWindowObject.on('networkChanged', (chainId) => {
        console.log('networkChanged')
        // notce! The chainId here is not equal to provider.chainId
        this.actions.update({ chainId: fromStarknetChainId(chainId) })
      })
    }
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return
    return (this.eagerConnection = import('get-starknet').then(async (m) => {
      try {
        const starknetWindowObject = await m.connect()
        this.starknetWindowObject = starknetWindowObject
        await starknetWindowObject?.enable()
        const provider = starknetWindowObject?.account
        if (provider) {
          this.provider = provider
        }
        this.listenEvents()
      } catch (e) {
        console.log('connect failed', e)
      }
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return cancelActivation()
    const accounts = await this.starknetWindowObject?.enable()
    this.actions.update({ chainId: fromStarknetChainId(this.provider.chainId), accounts })
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<void> {
    let cancelActivation: () => void
    if (!this.starknetWindowObject?.isConnected) cancelActivation = this.actions.startActivation()

    return this.isomorphicInitialize()
      .then(async () => {
        if (!this.provider) throw new NoStarknetWalletError()
        const receivedChainId = fromStarknetChainId(this.provider.chainId)
        return this.actions.update({ chainId: receivedChainId, accounts: [this.provider.address] })
      })
      .catch((error) => {
        cancelActivation?.()
        throw error
      })
  }

  public async watchAsset({ address, symbol, decimals, image }: WatchAssetParameters): Promise<true> {
    if (!this.provider) throw new Error('No provider')

    return true
  }
}
