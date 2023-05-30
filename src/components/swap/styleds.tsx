import { TooltipContainer } from 'components/Tooltip'
import { transparentize } from 'polished'
import { ReactNode } from 'react'
import { AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import styled, { css } from 'styled-components/macro'
import { lighten } from 'polished'
import { Z_INDEX } from 'theme/zIndex'

import { AutoColumn } from '../Column'

export const PageWrapper = styled.div`
  padding: 68px 8px 0px;
  max-width: 480px;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

// Mostly copied from `AppBody` but it was getting too hard to maintain backwards compatibility.
export const SwapWrapper = styled.main<{ margin?: string; maxWidth?: string }>`
  position: relative;
  background: ${({ theme }) => theme.backgroundSurface};
  border-radius: 0.5rem;
  padding: 16px;
  z-index: ${Z_INDEX.deprecated_content};
`

export const ArrowWrapper = styled.div<{ clickable: boolean }>`
  border-radius: 100px;
  height: 44px;
  width: 44px;
  position: relative;
  margin-top: -20px;
  margin-bottom: -20px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.backgroundInteractive};
  border: 0px solid;
  border-color: ${({ theme }) => theme.backgroundSurface};

  z-index: 2;

  :hover {
    border-color: ${({ theme }) => lighten(0.03, theme.backgroundInteractive)};
    background-color: ${({ theme }) => lighten(0.03, theme.backgroundInteractive)};
    box-shadow: ${({ theme }) => theme.shallowShadow};

    svg {
      stroke: ${({ theme }) => theme.textPrimary};
    }
  }

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
          }
        `
      : null}

  svg {
    stroke: ${({ theme }) => theme.textSecondary};
  }
`

export const SectionBreak = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.deprecated_bg3};
`

export const ErrorText = styled(Text) <{ severity?: 0 | 1 | 2 | 3 | 4 }>`
  color: ${({ theme, severity }) =>
    severity === 3 || severity === 4
      ? theme.deprecated_red1
      : severity === 2
        ? theme.deprecated_yellow2
        : severity === 1
          ? theme.deprecated_text1
          : theme.deprecated_text2};
`

export const TruncatedText = styled(Text)`
  text-overflow: ellipsis;
  max-width: 220px;
  overflow: hidden;
  text-align: right;
`

// styles
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

const SwapCallbackErrorInner = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.deprecated_red1)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.deprecated_red1};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.deprecated_red1)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.deprecated_primary3)};
  color: ${({ theme }) => theme.deprecated_primaryText1};
  padding: 0.5rem;
  border-radius: 12px;
  margin-top: 8px;
`

export const ResponsiveTooltipContainer = styled(TooltipContainer) <{ origin?: string; width?: string }>`
  background-color: ${({ theme }) => theme.deprecated_bg0};
  padding: 1rem;
  width: ${({ width }) => width ?? 'auto'};

  ${({ theme, origin }) => theme.deprecated_mediaWidth.deprecated_upToExtraSmall`
    transform: scale(0.8);
    transform-origin: ${origin ?? 'top left'};
  `}
`
