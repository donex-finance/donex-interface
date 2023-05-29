import { Theme, vars } from 'nft/css/sprinkles.css'

export const darkTheme: Theme = {
  colors: {
    accentFailure: vars.color.red300,
    accentFailureSoft: 'rgba(253, 118, 107, 0.12)',
    accentAction: vars.color.blue400,
    accentActionSoft: 'rgba(76, 130, 251, 0.24)',

    explicitWhite: '#FFFFFF',

    backgroundFloating: '0000000C',
    backgroundInteractive: vars.color.grey700,
    backgroundModule: vars.color.grey800,
    backgroundOutline: `rgba(153,161,189,0.24)`,
    backgroundSurface: vars.color.grey700,
    backgroundBackdrop: '#000',

    modalBackdrop: 'linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',

    stateOverlayHover: `rgba(153,161,189,0.08)`,
    green: vars.color.green200,
    gold: vars.color.gold200,
    violet: vars.color.violet200,

    textPrimary: '#FFFFFF',
    textSecondary: vars.color.grey300,
    textTertiary: vars.color.grey500,
  },
  shadows: {
    menu: '0px 10px 30px rgba(0, 0, 0, 0.1)',
    genieBlue: '0 4px 16px 0 rgba(70, 115, 250, 0.4)',
    elevation: '0px 4px 16px rgba(70, 115, 250, 0.4)',
    tooltip: '0px 4px 16px rgba(255, 255, 255, 0.2)',
    deep: '0px 24px 48px rgba(0, 0, 0, 0.3)',
    shallow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  },
  opacity: {
    hover: '0.6',
    pressed: '0.4',
  },
}
