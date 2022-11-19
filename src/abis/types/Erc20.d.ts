/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { BigNumber, BigNumberish } from 'ethers'
import { Contract } from 'starknet'

export class Erc20Interface extends Contract {
  name(): Promise<string>
  symbol(): Promise<string>

  approve(_spender: string, _value: BigNumberish): Promise<any>

  totalSupply(): Promise<BigNumber>
  decimals(): Promise<number>
  balanceOf(_owner: string): Promise<BigNumber>
}
