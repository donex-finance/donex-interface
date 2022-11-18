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

type GetStarknetWalletOptions = {
  walletId: 'argentX' | 'braavos'
}

export interface StarknetWalletConstructorArgs {
  actions: Actions
  options?: GetStarknetWalletOptions
  onError?: (error: Error) => void
}

export class StarknetWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: AccountInterface
  public customProvider?: AccountInterface
  public starknetWindowObject?: getStarknet.IStarknetWindowObject

  private readonly options?: GetStarknetWalletOptions
  private eagerConnection?: boolean

  constructor({ actions, options, onError }: StarknetWalletConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  private listenEvents() {
    if (this.starknetWindowObject) {
      this.starknetWindowObject.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // handle this edge case by disconnecting
          this.actions.resetState()
        } else {
          this.actions.update({ accounts })
        }
      })
      this.starknetWindowObject.on('networkChanged', (chainId) => {
        // notce! The chainId here is not equal to provider.chainId
        this.actions.update({ chainId: fromStarknetChainId(chainId) })
      })
    }
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    let starknetWindowObject = undefined
    if (this.options?.walletId === 'argentX') {
      starknetWindowObject = window.starknet_argentX
    } else {
      starknetWindowObject = window.starknet_braavos
    }
    this.starknetWindowObject = starknetWindowObject as any

    await this.starknetWindowObject?.enable()
    const provider = this.starknetWindowObject?.account
    if (provider) {
      this.provider = provider
    }
    this.listenEvents()

    this.eagerConnection = true
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
