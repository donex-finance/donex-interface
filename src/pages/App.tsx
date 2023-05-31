import { sendAnalyticsEvent, user } from 'analytics'
import { CUSTOM_USER_PROPERTIES, EventName, PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import { useFeatureFlagsIsLoaded } from 'featureFlags'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useIsDarkMode } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'
import { getBrowser } from 'utils/browser'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import ErrorBoundary from '../components/ErrorBoundary'
import NavBar from '../components/NavBar'
import Polling from '../components/Polling'
import Popups from '../components/Popups'
import { useIsExpertMode } from '../state/user/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import Pool from './Pool'
import { PositionPage } from './Pool/PositionPage'
import RemoveLiquidityV3 from './RemoveLiquidity/V3'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 48px 0px 0px 0px;
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 52px 0px 16px 0px;
  `};
`

const InfoAlert = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  width:100%;
  text-align:center;
  height:40px;
  line-height:40px;
  font-size:0.875rem;
  background: ${({ theme }) => theme.backgroundInteractive}
`

const HeaderWrapper = styled.div<{ scrolledState?: boolean; nftFlagEnabled?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  background-color: ${({ theme, nftFlagEnabled, scrolledState }) =>
    scrolledState && nftFlagEnabled && theme.backgroundSurface};
  border-bottom: ${({ theme, nftFlagEnabled, scrolledState }) =>
    scrolledState && nftFlagEnabled && `1px solid ${theme.backgroundOutline}`};
  width: 100%;
  justify-content: space-between;
  position: fixed;
  transition: ${({ theme, nftFlagEnabled }) =>
    nftFlagEnabled &&
    `background-color ${theme.transition.duration.fast} ease-in-out,
    border-width ${theme.transition.duration.fast} ease-in-out`};
  top: 40px;
  z-index: ${Z_INDEX.sticky};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function getCurrentPageFromLocation(locationPathname: string): PageName | undefined {
  switch (locationPathname) {
    case '/swap':
      return PageName.SWAP_PAGE
    case '/pool':
      return PageName.POOL_PAGE
    default:
      return undefined
  }
}

export default function App() {
  const isLoaded = useFeatureFlagsIsLoaded()

  const { pathname } = useLocation()
  const currentPage = getCurrentPageFromLocation(pathname)
  const isDarkMode = useIsDarkMode()
  const isExpertMode = useIsExpertMode()
  const [scrolledState, setScrolledState] = useState(false)

  // useAnalyticsReporter()
  // initializeAnalytics()

  const scrollListener = (e: Event) => {
    if (window.scrollY > 0) {
      setScrolledState(true)
    } else {
      setScrolledState(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    setScrolledState(false)
  }, [pathname])

  useEffect(() => {
    sendAnalyticsEvent(EventName.APP_LOADED)
    user.set(CUSTOM_USER_PROPERTIES.USER_AGENT, navigator.userAgent)
    user.set(CUSTOM_USER_PROPERTIES.BROWSER, getBrowser())
    user.set(CUSTOM_USER_PROPERTIES.SCREEN_RESOLUTION_HEIGHT, window.screen.height)
    user.set(CUSTOM_USER_PROPERTIES.SCREEN_RESOLUTION_WIDTH, window.screen.width)
    getCLS(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { cumulative_layout_shift: delta }))
    getFCP(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { first_contentful_paint_ms: delta }))
    getFID(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { first_input_delay_ms: delta }))
    getLCP(({ delta }: Metric) => sendAnalyticsEvent(EventName.WEB_VITALS, { largest_contentful_paint_ms: delta }))
  }, [])

  useEffect(() => {
    user.set(CUSTOM_USER_PROPERTIES.DARK_MODE, isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    user.set(CUSTOM_USER_PROPERTIES.EXPERT_MODE, isExpertMode)
  }, [isExpertMode])

  useEffect(() => {
    window.addEventListener('scroll', scrollListener)
  }, [])

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader />
      <ApeModeQueryParamReader />
      <InfoAlert>Transactions may be delayed due to slow execution on the Starknet Goerli Testnet.</InfoAlert>
      <AppWrapper>
        <Trace page={currentPage}>
          <HeaderWrapper scrolledState={scrolledState} nftFlagEnabled={false}>
            <NavBar />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Polling />
            <TopLevelModals />
            <Suspense fallback={<Loader />}>
              {isLoaded ? (
                <Routes>
                  <Route path="send" element={<RedirectPathToSwapOnly />} />
                  <Route path="swap/:outputCurrency" element={<RedirectToSwap />} />
                  <Route path="swap" element={<Swap />} />

                  <Route path="pool" element={<Pool />} />
                  <Route path="pool/:tokenId" element={<PositionPage />} />

                  <Route path="add" element={<RedirectDuplicateTokenIds />}>
                    {/* this is workaround since react-router-dom v6 doesn't support optional parameters any more */}
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                  </Route>

                  <Route path="increase" element={<AddLiquidity />}>
                    <Route path=":currencyIdA" />
                    <Route path=":currencyIdA/:currencyIdB" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount" />
                    <Route path=":currencyIdA/:currencyIdB/:feeAmount/:tokenId" />
                  </Route>

                  <Route path="remove/:tokenId" element={<RemoveLiquidityV3 />} />

                  <Route path="*" element={<RedirectPathToSwapOnly />} />
                </Routes>
              ) : (
                <Loader />
              )}
            </Suspense>
            <Marginer />
          </BodyWrapper>
        </Trace>
      </AppWrapper>
    </ErrorBoundary>
  )
}
