import type { Networkish } from '@ethersproject/networks'
import { createWeb3ReactStoreAndActions } from 'donex-sdk/web3-react/store'
import type { Actions, Connector, Web3ReactState, Web3ReactStore } from 'donex-sdk/web3-react/types'
import { useMemo } from 'react'
import { Provider, ProviderInterface } from 'starknet'
import type { UseBoundStore } from 'zustand'
import create from 'zustand'

export type Web3ReactHooks = ReturnType<typeof getStateHooks> &
  ReturnType<typeof getDerivedHooks> &
  ReturnType<typeof getAugmentedHooks>

export type Web3ReactSelectedHooks = ReturnType<typeof getSelectedConnector>

export type Web3ReactPriorityHooks = ReturnType<typeof getPriorityConnector>

/**
 * Wraps the initialization of a `connector`. Creates a zustand `store` with `actions` bound to it, and then passes
 * these to the connector as specified in `f`. Also creates a variety of `hooks` bound to this `store`.
 *
 * @typeParam T - The type of the `connector` returned from `f`.
 * @param f - A function which is called with `actions` bound to the returned `store`.
 * @returns [connector, hooks, store] - The initialized connector, a variety of hooks, and a zustand store.
 */
export function initializeConnector<T extends Connector>(
  f: (actions: Actions) => T
): [T, Web3ReactHooks, Web3ReactStore] {
  const [store, actions] = createWeb3ReactStoreAndActions()

  const connector = f(actions)
  const useConnector = create(store)

  const stateHooks = getStateHooks(useConnector)
  const derivedHooks = getDerivedHooks(stateHooks)
  const augmentedHooks = getAugmentedHooks<T>(connector, stateHooks, derivedHooks)

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }, store]
}

function computeIsActive({ chainId, accounts, activating }: Web3ReactState) {
  return Boolean(chainId && accounts && !activating)
}

/**
 * Creates a variety of convenience `hooks` that return data associated with a particular passed connector.
 *
 * @param initializedConnectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getSelectedConnector(
  ...initializedConnectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][]
) {
  function getIndex(connector: Connector) {
    const index = initializedConnectors.findIndex(([initializedConnector]) => connector === initializedConnector)
    if (index === -1) throw new Error('Connector not found')
    return index
  }

  function useSelectedStore(connector: Connector) {
    const store = initializedConnectors[getIndex(connector)][2]
    if (!store) throw new Error('Stores not passed')
    return store
  }

  // the following code calls hooks in a map a lot, which violates the eslint rule.
  // this is ok, though, because initializedConnectors never changes, so the same hooks are called each time
  function useSelectedChainId(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useChainId }]) => useChainId())
    return values[getIndex(connector)]
  }

  function useSelectedAccounts(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAccounts }]) => useAccounts())
    return values[getIndex(connector)]
  }

  function useSelectedIsActivating(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActivating }]) => useIsActivating())
    return values[getIndex(connector)]
  }

  function useSelectedAccount(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useAccount }]) => useAccount())
    return values[getIndex(connector)]
  }

  function useSelectedIsActive(connector: Connector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActive }]) => useIsActive())
    return values[getIndex(connector)]
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getSelectedConnector is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  function useSelectedProvider<T extends ProviderInterface = Provider>(
    connector: Connector,
    network?: Networkish
  ): T | undefined {
    const index = getIndex(connector)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useProvider }], i) => useProvider<T>(network, i === index))
    return values[index]
  }

  return {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  }
}

/**
 * Creates a variety of convenience `hooks` that return data associated with the first of the `initializedConnectors`
 * that is active.
 *
 * @param initializedConnectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * @returns hooks - A variety of convenience hooks that wrap the hooks returned from initializeConnector.
 */
export function getPriorityConnector(
  ...initializedConnectors: [Connector, Web3ReactHooks][] | [Connector, Web3ReactHooks, Web3ReactStore][]
) {
  const {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
  } = getSelectedConnector(...initializedConnectors)

  function usePriorityConnector() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const values = initializedConnectors.map(([, { useIsActive }]) => useIsActive())
    const index = values.findIndex((isActive) => isActive)
    return initializedConnectors[index === -1 ? 0 : index][0]
  }

  function usePriorityStore() {
    return useSelectedStore(usePriorityConnector())
  }

  function usePriorityChainId() {
    return useSelectedChainId(usePriorityConnector())
  }

  function usePriorityAccounts() {
    return useSelectedAccounts(usePriorityConnector())
  }

  function usePriorityIsActivating() {
    return useSelectedIsActivating(usePriorityConnector())
  }

  function usePriorityAccount() {
    return useSelectedAccount(usePriorityConnector())
  }

  function usePriorityIsActive() {
    return useSelectedIsActive(usePriorityConnector())
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getPriorityConnector is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  function usePriorityProvider<T extends ProviderInterface = Provider>(network?: Networkish) {
    return useSelectedProvider<T>(usePriorityConnector(), network)
  }

  return {
    useSelectedStore,
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    usePriorityConnector,
    usePriorityStore,
    usePriorityChainId,
    usePriorityAccounts,
    usePriorityIsActivating,
    usePriorityAccount,
    usePriorityIsActive,
    usePriorityProvider,
  }
}

const CHAIN_ID = ({ chainId }: Web3ReactState) => chainId
const ACCOUNTS = ({ accounts }: Web3ReactState) => accounts
const ACCOUNTS_EQUALITY_CHECKER = (oldAccounts: string[] | undefined, newAccounts: string[] | undefined) =>
  (oldAccounts === undefined && newAccounts === undefined) ||
  (oldAccounts !== undefined &&
    oldAccounts.length === newAccounts?.length &&
    oldAccounts.every((oldAccount, i) => oldAccount === newAccounts[i]))
const ACTIVATING = ({ activating }: Web3ReactState) => activating

function getStateHooks(useConnector: UseBoundStore<Web3ReactStore>) {
  function useChainId(): Web3ReactState['chainId'] {
    return useConnector(CHAIN_ID)
  }

  function useAccounts(): Web3ReactState['accounts'] {
    return useConnector(ACCOUNTS, ACCOUNTS_EQUALITY_CHECKER)
  }

  function useIsActivating(): Web3ReactState['activating'] {
    return useConnector(ACTIVATING)
  }

  return { useChainId, useAccounts, useIsActivating }
}

function getDerivedHooks({ useChainId, useAccounts, useIsActivating }: ReturnType<typeof getStateHooks>) {
  function useAccount(): string | undefined {
    return useAccounts()?.[0]
  }

  function useIsActive(): boolean {
    const chainId = useChainId()
    const accounts = useAccounts()
    const activating = useIsActivating()

    return computeIsActive({
      chainId,
      accounts,
      activating,
    })
  }

  return { useAccount, useIsActive }
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useAccounts, useChainId }: ReturnType<typeof getStateHooks>,
  { useAccount, useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  /**
   * Avoid type erasure by returning the most qualified type if not otherwise set.
   * Note that this function's return type is `T | undefined`, but there is a code path
   * that returns a Web3Provider, which could conflict with a user-provided T. So,
   * it's important that users only provide an override for T if they know that
   * `connector.customProvider` is going to be defined and of type T.
   *
   * @typeParam T - A type argument must only be provided if using `connector.customProvider`, in which case it
   * must match the type of this property.
   */
  function useProvider<T extends ProviderInterface = Provider>(network?: Networkish, enabled = true): T | undefined {
    const isActive = useIsActive()
    const chainId = useChainId()

    return useMemo(() => {
      // to ensure connectors remain fresh, we condition re-renders on loaded, isActive and chainId
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void isActive && chainId
      if (enabled) {
        if (connector.customProvider) return connector.customProvider as T
        // see tsdoc note above for return type explanation.
        else if (connector.provider) return new Provider(connector.provider) as unknown as T
      }
      return undefined
    }, [enabled, isActive, chainId])
  }

  return { useProvider }
}
