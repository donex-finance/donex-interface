import { Trans } from '@lingui/macro'
import { getChainInfoOrDefault } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { useWeb3React } from 'donex-sdk/web3-react/core'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'

const BodyRow = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 12px;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
`
const CautionTriangle = styled(AlertTriangle)`
  color: ${({ theme }) => theme.accentWarning};
`
const Link = styled(ExternalLink)`
  color: ${({ theme }) => theme.deprecated_black};
  text-decoration: underline;
`
const TitleRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
`
const TitleText = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  margin: 0px 12px;
`
const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 12px;
  border: none;
  bottom: 60px;
  display: none;
  max-width: 348px;
  padding: 16px 20px;
  position: fixed;
  right: 16px;
  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToMedium}px) {
    display: block;
  }
`

export function ChainConnectivityWarning() {
  const { chainId } = useWeb3React()
  const info = getChainInfoOrDefault(chainId)
  const label = info?.label

  return (
    <Wrapper>
      <TitleRow>
        <CautionTriangle />
        <TitleText>
          <Trans>Network Warning</Trans>
        </TitleText>
      </TitleRow>
      <BodyRow>
        {chainId === SupportedChainId.MAINNET ? (
          <Trans>You may have lost your network connection.</Trans>
        ) : (
          <Trans>{label} might be down right now, or you may have lost your network connection.</Trans>
        )}{' '}
      </BodyRow>
    </Wrapper>
  )
}
