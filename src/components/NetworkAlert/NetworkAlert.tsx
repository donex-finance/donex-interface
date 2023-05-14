import { Trans } from '@lingui/macro'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { ArrowUpRight } from 'react-feather'
import { useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import { AutoRow } from '../Row'

const L2Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 16px;
`

export const Controls = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  padding: 0 20px 20px 20px;
`

const BodyText = styled.div`
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px;
  font-size: 14px;
`
const RootWrapper = styled.div`
  position: relative;
  margin-top: 16px;
`

const SHOULD_SHOW_ALERT = {
  [SupportedChainId.TESTNET]: true,
}

export type NetworkAlertChains = keyof typeof SHOULD_SHOW_ALERT

const BG_COLORS_BY_DARK_MODE_AND_CHAIN_ID: {
  [darkMode in 'dark' | 'light']: { [chainId in NetworkAlertChains]: string }
} = {
  dark: {
    [SupportedChainId.TESTNET]:
      'radial-gradient(285% 8200% at 30% 50%, rgba(40, 160, 240, 0.05) 0%, rgba(219, 255, 0, 0) 100%),radial-gradient(75% 75% at 0% 0%, rgba(150, 190, 220, 0.05) 0%, rgba(33, 114, 229, 0.1) 100%), hsla(0, 0%, 100%, 0.05)',
  },
  light: {
    [SupportedChainId.TESTNET]:
      'radial-gradient(285% 8200% at 30% 50%, rgba(40, 160, 240, 0.1) 0%, rgba(219, 255, 0, 0) 100%),radial-gradient(circle at top left, hsla(206, 50%, 75%, 0.01), hsla(215, 79%, 51%, 0.12)), hsla(0, 0%, 100%, 0.1)',
  },
}

const ContentWrapper = styled.div<{ chainId: NetworkAlertChains; darkMode: boolean; logoUrl: string }>`
  background: ${({ chainId, darkMode }) => BG_COLORS_BY_DARK_MODE_AND_CHAIN_ID[darkMode ? 'dark' : 'light'][chainId]};
  padding:0.75rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  width: 100%;
`
const Header = styled.h2`
  font-weight: 500;
  font-size: 0.875rem;
  margin: 0;
`

const LinkOutToBridge = styled(ExternalLink)`
  align-items: center;
  border-radius: 8px;
  color: white;
  display: flex;
  font-size: 16px;
  justify-content: space-between;
  padding: 6px 8px;
  margin-right: 12px;
  text-decoration: none !important;
  width: 100%;
`

const StyledArrowUpRight = styled(ArrowUpRight)`
  margin-left: 12px;
  width: 24px;
  height: 24px;
`

const TEXT_COLORS: { [chainId in NetworkAlertChains]: string } = {
  [SupportedChainId.TESTNET]: '#0490ed',
}

function shouldShowAlert(chainId: number | undefined): chainId is NetworkAlertChains {
  return Boolean(chainId && SHOULD_SHOW_ALERT[chainId as unknown as NetworkAlertChains])
}

export function NetworkAlert() {
  const { chainId } = useWeb3React()
  const [darkMode] = useDarkModeManager()

  if (!shouldShowAlert(chainId)) {
    return null
  }

  const { logoUrl } = getChainInfo(chainId)
  const textColor = TEXT_COLORS[chainId]

  return (
    <RootWrapper>
      <ContentWrapper chainId={chainId} darkMode={darkMode} logoUrl={logoUrl}>
        <BodyText color={textColor}>
          <L2Icon src={logoUrl} />
          <AutoRow>
            <Header>
              <Trans>{`Notice: Interactions may be delayed due to slow execution on StarkNet's testnet.`}</Trans>
            </Header>
          </AutoRow>
        </BodyText>
      </ContentWrapper>
    </RootWrapper>
  )
}
