import BN from 'bn.js'
import type { ContractInterface as Interface } from 'starknet'

import { INVALID_CALL_STATE, LOADING_CALL_STATE } from '../constants'
import type { CallResult, CallState, CallStateResult } from '../types'
export function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: string | undefined,
  latestBlockNumber: number | undefined
): CallState {
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!contractInterface || !latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 0
  const syncing = (blockNumber ?? 0) < latestBlockNumber
  let result: CallStateResult | undefined = undefined
  if (success && data) {
    try {
      const originData = data.split(',').map((v) => new BN(v))
      result = (contractInterface as any).parseResponse(fragment, originData)
    } catch (error) {
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  }
}
