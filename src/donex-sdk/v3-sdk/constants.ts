export const FACTORY_ADDRESS = '0x37e72c3c1083e7e04e6173cd55b14414d236e091b26aba1f363add739052f57'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const SWAP_POOL_CLASS_HASH = '0x700d166be36a6e386cdba754ee582c5e8fabb415732fa30349292036e10ca4a'
export const SWAP_POOL_PROXY_CLASS_HASH = '0x59e254bc53bfa38270e06ed6c39f576ab9df8c59d04c2ee28c3bda1f4599d9b'

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
}
