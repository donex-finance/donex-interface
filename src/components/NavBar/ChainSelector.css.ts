import { style } from '@vanilla-extract/css'
import { sprinkles } from '../../nft/css/sprinkles.css'

export const ChainSelector = style([
  sprinkles({
    borderRadius: '4',
    height: '40',
    cursor: 'pointer',
    color: 'textPrimary',
    background: 'none',
    border: 'none'
  }),
])

export const Image = style([
  sprinkles({
    width: '20',
    height: '20',
  }),
])
