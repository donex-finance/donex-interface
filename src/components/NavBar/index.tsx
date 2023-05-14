import { Trans } from '@lingui/macro'
import LOGO_SVG from 'assets/images/logo.svg'
import { ButtonPrimary } from 'components/Button'
import Web3Status from 'components/Web3Status'
import { TEST_TOKEN } from 'constants/tokens'
import { CurrencyAmount } from 'donex-sdk/sdk-core'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { chainIdToBackendName } from 'graphql/data/util'
import JSBI from 'jsbi'
import { useMintTestToken } from 'lib/hooks/useMintTestToken'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { ReactNode } from 'react'
import { NavLink, NavLinkProps, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { ChainSelector } from './ChainSelector'
import { MenuDropdown } from './MenuDropdown'
import * as styles from './style.css'

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
}

const MenuItem = ({ href, id, isActive, children }: MenuItemProps) => {
  return (
    <NavLink
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none' }}
    >
      {children}
    </NavLink>
  )
}

const PageTabs = () => {
  const { pathname } = useLocation()
  const { chainId: connectedChainId } = useWeb3React()
  const chainName = chainIdToBackendName(connectedChainId)

  const isPoolActive =
    pathname.startsWith('/pool') ||
    pathname.startsWith('/add') ||
    pathname.startsWith('/remove') ||
    pathname.startsWith('/increase') ||
    pathname.startsWith('/find')

  return (
    <>
      <MenuItem href="/swap" isActive={pathname.startsWith('/swap')}>
        <Trans>Swap</Trans>
      </MenuItem>
      <MenuItem href="/pool" id={'pool-nav-link'} isActive={isPoolActive}>
        <Trans>Pool</Trans>
      </MenuItem>
    </>
  )
}

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  height:40px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const Navbar = () => {
  const [mintTestToken] = useMintTestToken(
    CurrencyAmount.fromRawAmount(TEST_TOKEN, JSBI.BigInt('10000000000000000000'))
  )
  return (
    <>
      <nav className={styles.nav}>
        <Box display="flex" height="full" flexWrap="nowrap" alignItems="stretch">
          <Box className={styles.leftSideContainer}>
            <Box as="a" href="#/swap" className={styles.logoContainer}>
              <img src={LOGO_SVG} alt="" />
            </Box>

            <Box display={{ sm: 'flex', lg: 'none' }}>
              <ChainSelector leftAlign={true} />
            </Box>
            <Row gap="8" display={{ sm: 'none', lg: 'flex' }}>
              <PageTabs />
            </Row>
          </Box>
          {/* <Box className={styles.middleContainer}>
            <SearchBar />
          </Box> */}
          <Box className={styles.rightSideContainer}>
            <Row gap="12">
              {/* <Box display={{ sm: 'flex', xl: 'none' }}>
                <SearchBar />
              </Box> */}
              {/* <Box display={{ sm: 'none', lg: 'flex' }}>
                <MenuDropdown />
              </Box> */}

              <Box display={{ sm: 'flex', lg: 'flex' }}>
                <ResponsiveButtonPrimary onClick={mintTestToken}>Faucet</ResponsiveButtonPrimary>
              </Box>

              <Box display={{ sm: 'none', lg: 'flex' }}>
                <ChainSelector />
              </Box>

              <Web3Status />
            </Row>
          </Box>
        </Box>
      </nav>
      <Box className={styles.mobileBottomBar}>
        <PageTabs />
        <Box marginY="4">
          <MenuDropdown />
        </Box>
      </Box>
    </>
  )
}

export default Navbar
