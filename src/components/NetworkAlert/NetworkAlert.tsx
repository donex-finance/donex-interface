import { Trans } from '@lingui/macro'
import { Info } from 'react-feather'
import styled from 'styled-components/macro'

const BodyText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0.5rem;
  font-size: 0.875rem;
  gap:1rem;
`
const RootWrapper = styled.div`
  position: relative;
  margin-top: 24px;
`

const ContentWrapper = styled.div`
  background: ${({ theme }) => theme.backgroundInteractive};
  padding:0.75rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  width: 100%;
`
const Header = styled.h2`
  font-weight: 400;
  font-size: 0.875rem;
  margin: 0;
`

export function NetworkAlert() {

  return (
    <RootWrapper>
      <ContentWrapper>
        <BodyText>
          <Info />
          <Header>
            <Trans>{`Bridge assets to Starknet`}</Trans>
          </Header>
        </BodyText>
      </ContentWrapper>
    </RootWrapper>
  )
}
