import { Trans } from '@lingui/macro'
import { NavBarSearchTypes, SectionName } from 'analytics/constants'
import { useTrace } from 'analytics/Trace'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { subheadSmall } from 'nft/css/common.css'
import { useSearchHistory } from 'nft/hooks'
import { fetchTrendingTokens } from 'nft/queries/genie/TrendingTokensFetcher'
import { FungibleToken } from 'nft/types'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'

import { ClockIcon, TrendingArrow } from '../../nft/components/icons'
import * as styles from './SearchBar.css'
import { SkeletonRow, TokenRow } from './SuggestionRow'

interface SearchBarDropdownSectionProps {
  toggleOpen: () => void
  suggestions: FungibleToken[]
  header: JSX.Element
  headerIcon?: JSX.Element
  hoveredIndex: number | undefined
  startingIndex: number
  setHoveredIndex: (index: number | undefined) => void
  isLoading?: boolean
  eventProperties: Record<string, unknown>
}

export const SearchBarDropdownSection = ({
  toggleOpen,
  suggestions,
  header,
  headerIcon = undefined,
  hoveredIndex,
  startingIndex,
  setHoveredIndex,
  isLoading,
  eventProperties,
}: SearchBarDropdownSectionProps) => {
  return (
    <Column gap="12">
      <Row paddingX="16" paddingY="4" gap="8" color="grey300" className={subheadSmall} style={{ lineHeight: '20px' }}>
        {headerIcon ? headerIcon : null}
        <Box>{header}</Box>
      </Row>
      <Column gap="12">
        {suggestions.map((suggestion, index) =>
          isLoading ? (
            <SkeletonRow key={index} />
          ) : (
            <TokenRow
              key={suggestion.address}
              token={suggestion as FungibleToken}
              isHovered={hoveredIndex === index + startingIndex}
              setHoveredIndex={setHoveredIndex}
              toggleOpen={toggleOpen}
              index={index + startingIndex}
              eventProperties={{
                position: index + startingIndex,
                selected_search_result_name: suggestion.name,
                selected_search_result_address: suggestion.address,
                ...eventProperties,
              }}
            />
          )
        )}
      </Column>
    </Column>
  )
}

interface SearchBarDropdownProps {
  toggleOpen: () => void
  tokens: FungibleToken[]
  queryText: string
  hasInput: boolean
  isLoading: boolean
}

export const SearchBarDropdown = ({ toggleOpen, tokens, queryText, hasInput, isLoading }: SearchBarDropdownProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(0)
  const { history: searchHistory, updateItem: updateSearchHistory } = useSearchHistory()
  const shortenedHistory = useMemo(() => searchHistory.slice(0, 2), [searchHistory])
  const { pathname } = useLocation()
  const isTokenPage = pathname.includes('/tokens')
  const [resultsState, setResultsState] = useState<ReactNode>()

  const { data: trendingTokenResults, isLoading: trendingTokensAreLoading } = useQuery(
    ['trendingTokens'],
    () => fetchTrendingTokens(4),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  )
  useEffect(() => {
    trendingTokenResults?.forEach(updateSearchHistory)
  }, [trendingTokenResults, updateSearchHistory])

  const trendingTokensLength = 4
  const trendingTokens = useMemo(
    () =>
      trendingTokenResults
        ? trendingTokenResults.slice(0, trendingTokensLength)
        : [...Array<FungibleToken>(trendingTokensLength)],
    [trendingTokenResults, trendingTokensLength]
  )

  const totalSuggestions = hasInput
    ? tokens.length
    : Math.min(shortenedHistory.length, 2) + (trendingTokens?.length ?? 0)

  // Navigate search results via arrow keys
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!hoveredIndex) {
          setHoveredIndex(totalSuggestions - 1)
        } else {
          setHoveredIndex(hoveredIndex - 1)
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (hoveredIndex && hoveredIndex === totalSuggestions - 1) {
          setHoveredIndex(0)
        } else {
          setHoveredIndex((hoveredIndex ?? -1) + 1)
        }
      }
    }

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [toggleOpen, hoveredIndex, totalSuggestions])

  const trace = useTrace({ section: SectionName.NAVBAR_SEARCH })

  useEffect(() => {
    const eventProperties = { total_suggestions: totalSuggestions, query_text: queryText, ...trace }
    if (!isLoading) {
      const tokenSearchResults =
        tokens.length > 0 ? (
          <SearchBarDropdownSection
            hoveredIndex={hoveredIndex}
            startingIndex={0}
            setHoveredIndex={setHoveredIndex}
            toggleOpen={toggleOpen}
            suggestions={tokens}
            eventProperties={{
              suggestion_type: NavBarSearchTypes.TOKEN_SUGGESTION,
              ...eventProperties,
            }}
            header={<Trans>Tokens</Trans>}
          />
        ) : (
          <Box className={styles.notFoundContainer}>
            <Trans>No tokens found.</Trans>
          </Box>
        )

      const currentState = () =>
        hasInput ? (
          // Empty or Up to 8 combined tokens and nfts
          <Column gap="20">{tokenSearchResults}</Column>
        ) : (
          // Recent Searches, Trending Tokens
          <Column gap="20">
            {shortenedHistory.length > 0 && (
              <SearchBarDropdownSection
                hoveredIndex={hoveredIndex}
                startingIndex={0}
                setHoveredIndex={setHoveredIndex}
                toggleOpen={toggleOpen}
                suggestions={shortenedHistory}
                eventProperties={{
                  suggestion_type: NavBarSearchTypes.RECENT_SEARCH,
                  ...eventProperties,
                }}
                header={<Trans>Recent searches</Trans>}
                headerIcon={<ClockIcon />}
              />
            )}

            <SearchBarDropdownSection
              hoveredIndex={hoveredIndex}
              startingIndex={shortenedHistory.length}
              setHoveredIndex={setHoveredIndex}
              toggleOpen={toggleOpen}
              suggestions={trendingTokens}
              eventProperties={{
                suggestion_type: NavBarSearchTypes.TOKEN_TRENDING,
                ...eventProperties,
              }}
              header={<Trans>Popular tokens</Trans>}
              headerIcon={<TrendingArrow />}
              isLoading={trendingTokensAreLoading}
            />
          </Column>
        )

      setResultsState(currentState)
    }
  }, [
    isLoading,
    tokens,
    trendingTokens,
    trendingTokensAreLoading,
    hoveredIndex,
    toggleOpen,
    shortenedHistory,
    hasInput,
    isTokenPage,
    queryText,
    totalSuggestions,
    trace,
  ])

  return (
    <Box className={styles.searchBarDropdown}>
      <Box opacity={isLoading ? '0.3' : '1'} transition="125">
        {resultsState}
      </Box>
    </Box>
  )
}
