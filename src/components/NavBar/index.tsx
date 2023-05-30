import { Trans } from '@lingui/macro'
import LOGO_SVG from 'assets/images/logo.svg'
import { ButtonSecondary } from 'components/Button'
import Web3Status from 'components/Web3Status'
import PendingStatus from 'components/PendingStatus'
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
import {
  Moon,
  Sun,
  Droplet
} from 'react-feather'
import { useDarkModeManager } from 'state/user/hooks'

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

const NavItem = styled(NavLink)`
  display:flex;
  align-items:center;
  border-radius:0.5rem;
  padding:0.75rem 1.5rem;
  height:40px;
  transition:color 0.2s;
  :hover {
    background:none;
    color: ${({ theme }) => theme.textPrimary};
  }
  &.active {
    background: ${({ theme }) => theme.backgroundInteractive};
  }
`

const MenuItem = ({ href, id, isActive, children }: MenuItemProps) => {
  return (
    <NavItem
      to={href}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none' }}
    >
      {children}
    </NavItem>
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
        <Trans>Pools</Trans>
      </MenuItem>
      <MenuItem href="/portfolio" id={'portfolio-link'} isActive={pathname.startsWith('/portfolio')}>
        <Trans>Portfolio</Trans>
      </MenuItem>
    </>
  )
}

const ResponsiveButtonPrimary = styled(ButtonSecondary)`
  height:40px;
  width: fit-content;
`

const SwitchThemeButton = styled(ButtonSecondary)`
  color: ${({ theme }) => theme.textPrimary};
  padding:0;
  background:none;
  height:40px;
  width: 40px;
  border-radius:20px;
  &:hover {
    background-color: ${({ theme }) => theme.backgroundInteractive};
  }
`

const Navbar = () => {

  const [darkMode, toggleDarkMode] = useDarkModeManager();

  const [mintTestToken] = useMintTestToken(
    CurrencyAmount.fromRawAmount(TEST_TOKEN, JSBI.BigInt('10000000000000000000'))
  )
  return (
    <>
      <nav className={styles.nav}>
        <Box display="flex" height="full" flexWrap="nowrap" alignItems="stretch">
          <Box className={styles.leftSideContainer}>
            <Box as="a" href="#/swap" className={styles.logoContainer}>
              <img src={LOGO_SVG} height="24" alt="" />
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

              <SwitchThemeButton onClick={() => toggleDarkMode()}>
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </SwitchThemeButton>

              <Box display={{ sm: 'none', lg: 'flex' }}>
                <ResponsiveButtonPrimary onClick={mintTestToken}><Droplet size={16} /> Faucet</ResponsiveButtonPrimary>
              </Box>

              <Box display={{ sm: 'none', lg: 'flex' }}>
                <ChainSelector />
              </Box>

              <PendingStatus />

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
