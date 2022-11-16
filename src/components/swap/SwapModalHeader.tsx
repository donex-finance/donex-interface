import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from 'analytics'
import { EventName, SWAP_PRICE_UPDATE_USER_RESPONSE } from 'analytics/constants'
import { getPriceUpdateBasisPoints } from 'analytics/utils'
import { Currency, Percent, TradeType } from 'donex-sdk/sdk-core'
import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import { InterfaceTrade } from 'state/routing/types'
import styled, { useTheme } from 'styled-components/macro'

import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
import { ThemedText } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { ButtonPrimary } from '../Button'
import { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import { FiatValue } from '../CurrencyInputPanel/FiatValue'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import TradePrice from '../swap/TradePrice'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'

const ArrowWrapper = styled.div`
  padding: 4px;
  border-radius: 12px;
  height: 40px;
  width: 40px;
  position: relative;
  margin-top: -18px;
  margin-bottom: -18px;
  left: calc(50% - 16px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 4px solid;
  border-color: ${({ theme }) => theme.backgroundModule};
  z-index: 2;
`

const formatAnalyticsEventProperties = (
  trade: InterfaceTrade<Currency, Currency, TradeType>,
  priceUpdate: number | undefined,
  response: SWAP_PRICE_UPDATE_USER_RESPONSE
) => ({
  chain_id:
    trade.inputAmount.currency.chainId === trade.outputAmount.currency.chainId
      ? trade.inputAmount.currency.chainId
      : undefined,
  response,
  token_in_symbol: trade.inputAmount.currency.symbol,
  token_out_symbol: trade.outputAmount.currency.symbol,
  price_update_basis_points: priceUpdate,
})

export default function SwapModalHeader({
  trade,
  shouldLogModalCloseEvent,
  setShouldLogModalCloseEvent,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: InterfaceTrade<Currency, Currency, TradeType>
  shouldLogModalCloseEvent: boolean
  setShouldLogModalCloseEvent: (shouldLog: boolean) => void
  allowedSlippage: Percent
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const theme = useTheme()

  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [lastExecutionPrice, setLastExecutionPrice] = useState(trade.executionPrice)
  const [priceUpdate, setPriceUpdate] = useState<number | undefined>()

  const fiatValueInput = useStablecoinValue(trade.inputAmount)
  const fiatValueOutput = useStablecoinValue(trade.outputAmount)

  useEffect(() => {
    if (!trade.executionPrice.equalTo(lastExecutionPrice)) {
      setPriceUpdate(getPriceUpdateBasisPoints(lastExecutionPrice, trade.executionPrice))
      setLastExecutionPrice(trade.executionPrice)
    }
  }, [lastExecutionPrice, setLastExecutionPrice, trade.executionPrice])

  useEffect(() => {
    if (shouldLogModalCloseEvent && showAcceptChanges)
      sendAnalyticsEvent(
        EventName.SWAP_PRICE_UPDATE_ACKNOWLEDGED,
        formatAnalyticsEventProperties(trade, priceUpdate, SWAP_PRICE_UPDATE_USER_RESPONSE.REJECTED)
      )
    setShouldLogModalCloseEvent(false)
  }, [shouldLogModalCloseEvent, showAcceptChanges, setShouldLogModalCloseEvent, trade, priceUpdate])

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '1rem' }}>
      <LightCard padding="0.75rem 1rem">
        <AutoColumn gap={'8px'}>
          <RowBetween align="center">
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.deprecated_primary1 : ''}
              >
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.inputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <FiatValue fiatValue={fiatValueInput} />
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <ArrowWrapper>
        <ArrowDown size="16" color={theme.textPrimary} />
      </ArrowWrapper>
      <LightCard padding="0.75rem 1rem" style={{ marginBottom: '0.25rem' }}>
        <AutoColumn gap={'8px'}>
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              <TruncatedText fontSize={24} fontWeight={500}>
                {trade.outputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.outputAmount.currency} size={'20px'} style={{ marginRight: '12px' }} />
              <Text fontSize={20} fontWeight={500}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize={14} color={theme.deprecated_text3}>
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)}
              />
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </AutoColumn>
      </LightCard>
      <RowBetween style={{ marginTop: '0.25rem', padding: '0 1rem' }}>
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween>
      <LightCard style={{ padding: '.75rem', marginTop: '0.5rem' }}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </LightCard>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <ThemedText.DeprecatedMain color={theme.deprecated_primary1}>
                <Trans>Price Updated</Trans>
              </ThemedText.DeprecatedMain>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              <Trans>Accept</Trans>
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '.75rem 1rem' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Output is estimated. You will receive at least{' '}
              <b>
                {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        ) : (
          <ThemedText.DeprecatedItalic fontWeight={400} textAlign="left" style={{ width: '100%' }}>
            <Trans>
              Input is estimated. You will sell at most{' '}
              <b>
                {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
              </b>{' '}
              or the transaction will revert.
            </Trans>
          </ThemedText.DeprecatedItalic>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <ThemedText.DeprecatedMain>
            <Trans>
              Output will be sent to{' '}
              <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
            </Trans>
          </ThemedText.DeprecatedMain>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
