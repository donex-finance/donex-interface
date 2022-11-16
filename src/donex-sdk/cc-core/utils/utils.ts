import BN from 'bn.js'
import { Buffer } from 'buffer'
import { BigNumberish, toBN } from 'starknet/utils/number'

const P = new BN('3618502788666131213697322783095070105623107215331596699973092056135872020481')

export function feltToString(felt: any) {
  if (!felt) return ''
  const newStrB = Buffer.from(felt.toString(16), 'hex')
  return newStrB.toString()
}

export function stringToFelt(str: string) {
  return '0x' + Buffer.from(str).toString('hex')
}

export function intToFelt(value: BigNumberish, base?: number | 'hex') {
  const v = toBN(value, base)

  if (v.lt(new BN(0))) {
    return P.add(v).toString()
  }

  return v.toString()
}

export function feltToInt(value: string) {
  const v = toBN(value)

  if (v.gt(P.div(new BN(2)))) {
    return P.sub(v).neg().toString()
  }

  return v.toString()
}

export function hextoString(hex: string) {
  const arr = hex.split('')
  let out = ''
  for (let i = 0; i < arr.length / 2; i++) {
    const tmp = '0x' + arr[i * 2] + arr[i * 2 + 1]
    const charValue = String.fromCharCode(tmp as any)
    out += charValue
  }
  return out
}
