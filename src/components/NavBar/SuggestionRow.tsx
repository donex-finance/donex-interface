import { sendAnalyticsEvent } from 'analytics'
import { EventName } from 'analytics/constants'
import clsx from 'clsx'
import { L2NetworkLogo, LogoContainer } from 'components/Tokens/TokenTable/TokenRow'
import TokenSafetyIcon from 'components/TokenSafety/TokenSafetyIcon'
import { getChainInfo } from 'constants/chainInfo'
import { checkWarning } from 'constants/tokenSafety'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { getTokenDetailsURL } from 'graphql/data/util'
import uriToHttp from 'lib/utils/uriToHttp'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import { vars } from 'nft/css/sprinkles.css'
import { useSearchHistory } from 'nft/hooks'
import { FungibleToken } from 'nft/types'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDollar } from 'utils/formatNumbers'

import * as styles from './SearchBar.css'

function useBridgedAddress(token: FungibleToken): [string | undefined, number | undefined, string | undefined] {
  const { chainId: connectedChainId } = useWeb3React()
  const bridgedAddress = connectedChainId ? token.extensions?.bridgeInfo?.[connectedChainId]?.tokenAddress : undefined
  if (bridgedAddress && connectedChainId) {
    return [bridgedAddress, connectedChainId, getChainInfo(connectedChainId)?.circleLogoUrl]
  }
  return [undefined, undefined, undefined]
}

interface TokenRowProps {
  token: FungibleToken
  isHovered: boolean
  setHoveredIndex: (index: number | undefined) => void
  toggleOpen: () => void
  index: number
  eventProperties: Record<string, unknown>
}

export const TokenRow = ({ token, isHovered, setHoveredIndex, toggleOpen, index, eventProperties }: TokenRowProps) => {
  const [brokenImage, setBrokenImage] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const addToSearchHistory = useSearchHistory((state: { addItem: (item: FungibleToken) => void }) => state.addItem)
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    addToSearchHistory(token)
    toggleOpen()
    sendAnalyticsEvent(EventName.NAVBAR_RESULT_SELECTED, { ...eventProperties })
  }, [addToSearchHistory, toggleOpen, token, eventProperties])

  const [bridgedAddress, bridgedChain, L2Icon] = useBridgedAddress(token)
  const tokenDetailsPath = getTokenDetailsURL(bridgedAddress ?? token.address, undefined, bridgedChain ?? token.chainId)
  // Close the modal on escape
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isHovered) {
        event.preventDefault()
        navigate(tokenDetailsPath)
        handleClick()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [toggleOpen, isHovered, token, navigate, handleClick, tokenDetailsPath])

  return (
    <Link
      to={tokenDetailsPath}
      onClick={handleClick}
      onMouseEnter={() => !isHovered && setHoveredIndex(index)}
      onMouseLeave={() => isHovered && setHoveredIndex(undefined)}
      className={styles.suggestionRow}
      style={{ background: isHovered ? vars.color.lightGrayOverlay : 'none' }}
    >
      <Row style={{ width: '65%' }}>
        {!brokenImage && token.logoURI ? (
          <LogoContainer>
            <Box
              as="img"
              src={token.logoURI.includes('ipfs://') ? uriToHttp(token.logoURI)[0] : token.logoURI}
              alt={token.name}
              className={clsx(loaded ? styles.suggestionImage : styles.imageHolder)}
              onError={() => setBrokenImage(true)}
              onLoad={() => setLoaded(true)}
            />
            <L2NetworkLogo networkUrl={L2Icon} size="16px" />
          </LogoContainer>
        ) : (
          <Box className={styles.imageHolder} />
        )}
        <Column className={styles.suggestionPrimaryContainer}>
          <Row gap="4" width="full">
            <Box className={styles.primaryText}>{token.name}</Box>
            <TokenSafetyIcon warning={checkWarning(token.address)} />
          </Row>
          <Box className={styles.secondaryText}>{token.symbol}</Box>
        </Column>
      </Row>

      <Column className={styles.suggestionSecondaryContainer}>
        {token.priceUsd && (
          <Row gap="4">
            <Box className={styles.primaryText}>{formatDollar({ num: token.priceUsd, isPrice: true })}</Box>
          </Row>
        )}
        {token.price24hChange && (
          <Box className={styles.secondaryText} color={token.price24hChange >= 0 ? 'green400' : 'red400'}>
            {token.price24hChange.toFixed(2)}%
          </Box>
        )}
      </Column>
    </Link>
  )
}

export const SkeletonRow = () => {
  return (
    <Row className={styles.suggestionRow}>
      <Row width="full">
        <Box className={styles.imageHolder} />
        <Column gap="4" width="full">
          <Row justifyContent="space-between">
            <Box borderRadius="round" height="20" background="backgroundModule" style={{ width: '180px' }} />
            <Box borderRadius="round" height="20" width="48" background="backgroundModule" />
          </Row>

          <Row justifyContent="space-between">
            <Box borderRadius="round" height="16" width="120" background="backgroundModule" />
            <Box borderRadius="round" height="16" width="48" background="backgroundModule" />
          </Row>
        </Column>
      </Row>
    </Row>
  )
}
