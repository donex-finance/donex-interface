/* eslint-disable simple-import-sort/imports */
import { PricePoint } from './TokenPrice'
import type { Chain, TopTokens100Query } from './__generated__/TopTokens100Query.graphql'

export type PrefetchedTopToken = NonNullable<TopTokens100Query['response']['topTokens']>[number]

// Number of items to render in each fetch in infinite scroll.
export const PAGE_SIZE = 20

export type TopToken = NonNullable<NonNullable<TopTokens100Query['response']>['topTokens']>[number]
export type SparklineMap = { [key: string]: PricePoint[] | undefined }
interface UseTopTokensReturnValue {
  tokens: TopToken[] | undefined
  sparklines: SparklineMap
}

export function useTopTokens(chain: Chain): UseTopTokensReturnValue {
  return {
    tokens: [],
    sparklines: {},
  }
  // const chainId = CHAIN_NAME_TO_CHAIN_ID[chain]
  // const duration = toHistoryDuration(useAtomValue(filterTimeAtom))

  // const environment = useRelayEnvironment()
  // const [sparklines, setSparklines] = useState<SparklineMap>({})
  // useEffect(() => {
  //   const subscription = fetchQuery<TopTokensSparklineQuery>(environment, tokenSparklineQuery, { duration, chain })
  //     .map((data) => ({
  //       topTokens: data.topTokens?.map((token) => unwrapToken(chainId, token)),
  //     }))
  //     .subscribe({
  //       next(data) {
  //         const map: SparklineMap = {}
  //         data.topTokens?.forEach(
  //           (current) =>
  //             current?.address && (map[current.address] = current?.market?.priceHistory?.filter(isPricePoint))
  //         )
  //         setSparklines(map)
  //       },
  //     })
  //   return () => subscription.unsubscribe()
  // }, [chain, chainId, duration, environment])

  // useEffect(() => {
  //   setSparklines({})
  // }, [duration])

  // const { topTokens } = useLazyLoadQuery<TopTokens100Query>(topTokens100Query, { duration, chain })
  // const mappedTokens = useMemo(() => topTokens?.map((token) => unwrapToken(chainId, token)) ?? [], [chainId, topTokens])
  // const filteredTokens = useFilteredTokens(mappedTokens)
  // const sortedTokens = useSortedTokens(filteredTokens)
  // return useMemo(() => ({ tokens: sortedTokens, sparklines }), [sortedTokens, sparklines])
}
