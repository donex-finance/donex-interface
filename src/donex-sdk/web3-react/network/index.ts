import { SupportedChainId } from 'donex-sdk/sdk-core'
import type { Actions } from 'donex-sdk/web3-react/types'
import { Connector } from 'donex-sdk/web3-react/types'
import { Provider, ProviderInterface, ProviderOptions } from 'starknet'
// eslint-disable-next-line no-restricted-imports
import { StarknetChainId } from 'starknet/dist/constants'

/**
 * @param urlMap - A mapping from chainIds to RPC urls.
 * @param defaultChainId - The chainId to connect to in activate if one is not provided.
 * @param timeout - Timeout, in milliseconds, after which to treat network calls to urls as failed when selecting
 * online providers.
 */
export interface NetworkConstructorArgs {
  actions: Actions
  urlMap: { [chainId: number]: ProviderOptions | ProviderOptions[] | ProviderInterface | ProviderInterface[] }
  defaultChainId?: number
  timeout?: number
}

function stringToHex(str: string) {
  let str2 = Buffer.from(str).toString('hex')
  if (str2.length % 2 === 1) {
    str2 = '0' + str2
  }
  return '0x' + str2
}

export function fromStarknetChainId(chainId: string) {
  if (chainId && chainId.indexOf('0x') !== 0) chainId = stringToHex(chainId)
  if (chainId === StarknetChainId.MAINNET) {
    return SupportedChainId.MAINNET
  } else if (chainId === StarknetChainId.TESTNET) {
    return SupportedChainId.TESTNET
  } else {
    return SupportedChainId.MAINNET
  }
}

export function toStarknetChainId(chainId: number) {
  if (chainId === SupportedChainId.MAINNET) {
    return StarknetChainId.MAINNET
  } else if (chainId === SupportedChainId.TESTNET) {
    return StarknetChainId.TESTNET
  } else {
    return StarknetChainId.MAINNET
  }
}

export class Network extends Connector {
  /** {@inheritdoc Connector.provider} */
  public readonly provider: undefined
  /** {@inheritdoc Connector.customProvider} */
  public customProvider?: ProviderInterface

  private readonly providerCache: Record<number, Promise<ProviderInterface> | undefined> = {}

  private readonly urlMap: Record<number, ProviderOptions[] | ProviderInterface[]>
  private readonly defaultChainId: number
  private readonly timeout: number

  constructor({
    actions,
    urlMap,
    defaultChainId = Number(Object.keys(urlMap)[0]),
    timeout = 5000,
  }: NetworkConstructorArgs) {
    super(actions)

    this.urlMap = Object.keys(urlMap).reduce<typeof this.urlMap>((accumulator, chainId) => {
      const urls = urlMap[Number(chainId)]

      if (Array.isArray(urls)) {
        accumulator[Number(chainId)] = urls
      } else {
        // thie ternary just makes typescript happy, since it can't infer that the array has elements of the same type
        accumulator[Number(chainId)] = [urls as ProviderInterface]
      }

      return accumulator
    }, {})
    this.defaultChainId = defaultChainId
    this.timeout = timeout
  }

  private async isomorphicInitialize(chainId: number): Promise<ProviderInterface> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.providerCache[chainId]) return this.providerCache[chainId]!

    const urls = this.urlMap[chainId]

    // early return if we have a single jsonrpc provider already
    if (urls.length === 1 && urls[0] instanceof ProviderInterface) {
      return (this.providerCache[chainId] = Promise.resolve(urls[0]))
    }

    return (this.providerCache[chainId] = Promise.resolve(new Provider(urls[0])))
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainId - The desired chain to connect to.
   */
  public async activate(desiredChainId = this.defaultChainId): Promise<void> {
    let cancelActivation: () => void
    if (!this.providerCache[desiredChainId]) {
      cancelActivation = this.actions.startActivation()
    }

    return this.isomorphicInitialize(desiredChainId)
      .then(async (customProvider) => {
        this.customProvider = customProvider

        const chainId = fromStarknetChainId(this.customProvider.chainId)
        this.actions.update({ chainId, accounts: [] })
      })
      .catch((error: Error) => {
        cancelActivation?.()
        throw error
      })
  }
}
