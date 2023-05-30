import { lighten, darken } from 'polished'
import { Check, ChevronDown } from 'react-feather'
import { Button as RebassButton, ButtonProps as ButtonPropsOriginal } from 'rebass/styled-components'
import styled, { useTheme } from 'styled-components/macro'

import { RowBetween } from '../Row'

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>

export const BaseButton = styled(RebassButton) <
  {
    padding?: string
    width?: string
    $borderRadius?: string
    altDisabledStyle?: boolean
  } & ButtonProps
>`
  padding: 0.75rem 1.5rem;
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: 0.5rem;
  outline: none;
  color: ${({ theme }) => theme.deprecated_text1};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;

  color: ${({ theme }) => theme.textPrimary};
  background: ${({ theme }) => theme.backgroundInteractive};
  cursor: pointer;
  user-select: none;
  gap:0.75rem;

  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

export const ButtonPrimary = styled(BaseButton)`
  background-color: ${({ theme }) => theme.accentAction};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  &:hover {
    background-color: #2454FF;
  }
  &:disabled {
    opacity:60%;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`

export const ButtonGray = styled(BaseButton)`
  background-color: ${({ theme }) => theme.deprecated_bg1};
  color: ${({ theme }) => theme.deprecated_text2};
  font-size: 0.875rem;
  font-weight: 500;
`

export const ButtonSecondary = styled(BaseButton)`
  width:auto;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ theme }) => theme.backgroundInteractive};

  :hover {
    background-color: ${({ theme }) => lighten(0.03, theme.backgroundInteractive)};
    box-shadow: ${({ theme }) => theme.shallowShadow};
  }

`

export const ButtonOutlined = styled(ButtonSecondary)`
  background-color: transparent;
  color: ${({ theme }) => theme.deprecated_text1};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.deprecated_bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.deprecated_bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.deprecated_bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonYellow = styled(BaseButton)`
  background-color: ${({ theme }) => theme.accentWarningSoft};
  color: ${({ theme }) => theme.accentWarning};
  &:focus {
    background-color: ${({ theme }) => theme.accentWarningSoft};
  }
  &:hover {
    background: ${({ theme }) => theme.stateOverlayHover};
    mix-blend-mode: normal;
  }
  &:active {
    background-color: ${({ theme }) => theme.accentWarningSoft};
  }
  &:disabled {
    background-color: ${({ theme }) => theme.accentWarningSoft};
    opacity: 60%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.deprecated_primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonText = styled(BaseButton)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    text-decoration: underline;
  }
  &:hover {
    // text-decoration: underline;
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonConfirmedStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  color: ${({ theme }) => theme.deprecated_text1};
  /* border: 1px solid ${({ theme }) => theme.deprecated_green1}; */

  &:disabled {
    opacity: 50%;
    background-color: ${({ theme }) => theme.deprecated_bg2};
    color: ${({ theme }) => theme.deprecated_text2};
    cursor: auto;
  }
`

const ButtonErrorStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.deprecated_red1};
  border: 1px solid ${({ theme }) => theme.deprecated_red1};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.deprecated_red1)};
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_red1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.deprecated_red1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.deprecated_red1)};
    background-color: ${({ theme }) => darken(0.1, theme.deprecated_red1)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.deprecated_red1};
    border: 1px solid ${({ theme }) => theme.deprecated_red1};
  }
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.deprecated_primary1};
`

const Circle = styled.div`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.deprecated_primary1};
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckboxWrapper = styled.div`
  width: 20px;
  padding: 0 10px;
  position: absolute;
  top: 11px;
  right: 15px;
`

const ResponsiveCheck = styled(Check)`
  size: 13px;
`

export function ButtonRadioChecked({ active = false, children, ...rest }: { active?: boolean } & ButtonProps) {
  const theme = useTheme()

  if (!active) {
    return (
      <ButtonOutlined $borderRadius="12px" padding="12px 8px" {...rest}>
        {<RowBetween>{children}</RowBetween>}
      </ButtonOutlined>
    )
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" $borderRadius="12px">
        {
          <RowBetween>
            {children}
            <CheckboxWrapper>
              <Circle>
                <ResponsiveCheck size={13} stroke={theme.deprecated_white} />
              </Circle>
            </CheckboxWrapper>
          </RowBetween>
        }
      </ActiveOutlined>
    )
  }
}

export const MediumButton = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundInteractive};
  border-radius: 16px;
  border: 0;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-weight: 600;
  gap: 12px;
  justify-content: center;
  padding: 16px;
  transition: 150ms ease background-color opacity;

  :disabled {
    background-color: ${({ theme }) => theme.backgroundInteractive};
    cursor: default;
    opacity: 0.6;
  }
  :hover {
    background-color: ${({ theme }) => theme.stateOverlayHover};
  }
  :active {
    background-color: ${({ theme }) => theme.stateOverlayPressed};
  }
  :focus {
    background-color: ${({ theme }) => theme.stateOverlayPressed};
  }
`
