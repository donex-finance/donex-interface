import { Call as StarknetCall } from 'starknet'

import { Call } from '../types'

export function fromStarknetCall(call: StarknetCall): Call {
  return {
    address: call.contractAddress,
    callData: JSON.stringify([call.contractAddress, call.entrypoint, call.calldata]),
  }
}

export function toStarknetCall(call: Call): StarknetCall {
  const obj = JSON.parse(call.callData)
  return {
    contractAddress: obj[0] || call.address,
    entrypoint: obj[1],
    calldata: obj[2],
  }
}
