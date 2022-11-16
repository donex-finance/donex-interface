import { Contract } from 'starknet'

import { MethodArg } from './validation'

type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined
export const multicallContractDatas: {
  [chainId: number]: {
    [key: string]: {
      contract: Contract
      methodName: string
      callInput: OptionalMethodInputs
    }
  }
} = {}
