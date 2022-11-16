import { Percent } from 'donex-sdk/sdk-core'

export interface FeeOptions {
  /**
   * The percent of the output that will be taken as a fee.
   */
  fee: Percent

  /**
   * The recipient of the fee.
   */
  recipient: string
}
