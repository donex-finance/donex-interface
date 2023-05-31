import { Trans } from '@lingui/macro'
import { lighten } from 'polished'
import { getChainInfo } from 'constants/chainInfo'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'

const L2Icon = styled.img`
  width: 1.125rem;
  height: 1.125rem;
  margin-right:0.5rem;
`

const BodyText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 0.875rem;
  gap:0.125rem;
`
const RootWrapper = styled.div`
  position: relative;
  margin-top: 48px;
`

const ContentWrapper = styled.div`
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  width: 100%;
`

const StyledUpArrow = styled(ArrowUpRight)`
  height: 1.125rem;
  color: ${({ theme }) => theme.textSecondary};
`
const BridgeButton = styled.a`
  padding: 0.75rem 1.5rem;
  background:none;
  color: ${({ theme }) => theme.textPrimary};
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  outline:none;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  border-radius: 0.5rem;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  text-decoration:none;
  gap:0.5rem;
  background-color: ${({ theme }) => theme.backgroundInteractive};

  :hover {
    background-color: ${({ theme }) => lighten(0.03, theme.backgroundInteractive)};
    box-shadow: ${({ theme }) => theme.shallowShadow};
  }
`

export function NetworkAlert() {
  const { chainId } = useWeb3React()

  if (!chainId) {
    return null
  }

  const { logoUrl } = getChainInfo(chainId)

  return (
    <RootWrapper>
      <ContentWrapper >
        <BridgeButton target="_blank" href="https://goerli.starkgate.starknet.io/">
          <L2Icon src={logoUrl} />
          <Trans>{`Bridge assets to Starknet Goerli`}</Trans>
          <StyledUpArrow size={18} />
        </BridgeButton>
      </ContentWrapper>
    </RootWrapper>
  )
}
