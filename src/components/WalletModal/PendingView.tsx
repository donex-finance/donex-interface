import { Trans } from '@lingui/macro'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import { Connector } from 'donex-sdk/web3-react/types'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Loader from '../Loader'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const WaitingToConnectSection = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`

const AlertTriangleIcon = styled(AlertTriangle)`
  width: 25%;
  height: 25%;
  stroke-width: 1;
  padding-bottom: 2rem;
  color: ${({ theme }) => theme.accentCritical};
`

const LoaderContainer = styled.div`
  margin: 16px 0;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`

const LoadingMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
`

export default function PendingView({
  connector,
  error = false,
  tryActivation,
  openOptions,
}: {
  connector: Connector
  error?: boolean
  tryActivation: (connector: Connector) => void
  openOptions: () => void
}) {
  return (
    <PendingSection>
      <LoadingMessage>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <AlertTriangleIcon />
              <ThemedText.MediumHeader marginBottom={12}>
                <Trans>Error connecting</Trans>
              </ThemedText.MediumHeader>
              <ThemedText.BodyPrimary fontSize={16} marginBottom={36} textAlign="center">
                <Trans>
                  The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
                </Trans>
              </ThemedText.BodyPrimary>
              <ButtonPrimary
                $borderRadius="12px"
                onClick={() => {
                  tryActivation(connector)
                }}
              >
                <Trans>Try Again</Trans>
              </ButtonPrimary>
              <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
                <ThemedText.Link onClick={openOptions}>
                  <Trans>Back to wallet selection</Trans>
                </ThemedText.Link>
              </ButtonEmpty>
            </ErrorGroup>
          ) : (
            <>
              <WaitingToConnectSection>
                <LoaderContainer style={{ padding: '16px 0px' }}>
                  <Loader strokeWidth={0.8} size="100px" />
                </LoaderContainer>
                <ThemedText.MediumHeader>
                  <Trans>Waiting to connect</Trans>
                </ThemedText.MediumHeader>
                <ThemedText.BodyPrimary style={{ paddingTop: '8px' }}>
                  <Trans>Confirm this connection in your wallet</Trans>
                </ThemedText.BodyPrimary>
              </WaitingToConnectSection>
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
    </PendingSection>
  )
}
