import { MULTICALL_ABI } from 'abis'
import { Contract as Interface } from 'starknet'

import { MethodParameters, toHex } from './utils'

export abstract class Multicall {
  public static INTERFACE: Interface = new Interface(MULTICALL_ABI as any, '')

  /**
   * Cannot be constructed.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static encodeMulticall(calldatas: string | string[]): string {
    if (!Array.isArray(calldatas)) {
      calldatas = [calldatas]
    }
    return calldatas[0]
  }

  public static encodeMethodParameters(calldatas: string | string[], value = 0): MethodParameters {
    if (!Array.isArray(calldatas)) {
      calldatas = [calldatas]
    }
    if (calldatas.length === 1) {
      return {
        calldata: calldatas[0],
        value: toHex(value),
      }
    } else {
      return {
        calldata: '',
        calldatas,
        value: toHex(value),
      }
    }
  }
}
