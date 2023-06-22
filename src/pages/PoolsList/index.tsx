import { Trans } from '@lingui/macro'
import { PageName } from 'analytics/constants'
import { Trace } from 'analytics/Trace'
import { AutoColumn } from 'components/Column'
// import { TraceEvent } from 'analytics/TraceEvent'
import { ThemedText } from 'theme'

import { RowBetween } from 'components/Row'

import styled from 'styled-components/macro'

const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.deprecated_text2};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  `};
  margin-bottom: 3rem;
`

const PoolRow = styled(RowBetween)`
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
`

const TitleColumn = styled(AutoColumn)`
  color: ${({ theme }) => theme.textSecondary};
  font-weight:600;
`

const StatsWrapper = styled.div`
display:flex;
align-items:left;
justify-content:left;
gap:1.5rem;
margin-bottom: 3rem;
`

const StatsColumn = styled.div`
display:flex;
align-items: flex-start;
padding:1.5rem;
flex-direction: column;
width:100%;
background: ${({ theme }) => theme.backgroundSurface};
border-radius:0.5rem;
font-size:0.875rem;
color: ${({ theme }) => theme.textSecondary};
font-weight:600;
gap:0.75rem;
`


export default function PoolsList() {
  return (
    <Trace page={PageName.POSITIONS_PAGE} shouldLogImpression>
      <>
        <PageWrapper>
          <TitleRow padding={'0'}>
            <ThemedText.LargeHeader>
              <Trans>Liquidity Pools</Trans>
            </ThemedText.LargeHeader>
          </TitleRow>

          <StatsWrapper>
            <StatsColumn><Trans>Total Value Locked</Trans>
              <ThemedText.MediumHeader>
                <Trans>$ 15,293,927</Trans>
              </ThemedText.MediumHeader>
            </StatsColumn>
            <StatsColumn><Trans>Volume</Trans>
              <ThemedText.MediumHeader>
                <Trans>$ 15,293,927</Trans>
              </ThemedText.MediumHeader>
            </StatsColumn>
          </StatsWrapper>

          <RowBetween paddingY={16}>
            <TitleColumn><Trans>Liquidity Pool</Trans></TitleColumn>
            <TitleColumn><Trans>TVL</Trans></TitleColumn>
            <TitleColumn><Trans>24h Volume</Trans></TitleColumn>
          </RowBetween>
          <RowBetween paddingY={16}>
            <TitleColumn><Trans>ETH / USDC</Trans></TitleColumn>
            <TitleColumn><Trans>$ 3,403,291</Trans></TitleColumn>
            <TitleColumn><Trans>$ 256,012</Trans></TitleColumn>
          </RowBetween>
        </PageWrapper>
      </>
    </Trace>
  )
}

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 500px;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`