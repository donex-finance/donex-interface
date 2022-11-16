export function mulDiv(a: bigint, b: bigint, denominator: bigint) {
  return ((a * b) / denominator) % BigInt(2 ** 256)
}

export function mulDivRoundingUp(a: bigint, b: bigint, c: bigint) {
  // TODO: consider overflow when a(uint256) * b(uint256)
  const tmp = a * b
  let res = tmp / c
  if (tmp % c > BigInt(0)) {
    res = res + BigInt(1)
  }
  return res
}

export function divRoundingUp(a: bigint, b: bigint) {
  let res = a / b
  if (a % b > BigInt(0)) {
    res = res + BigInt(1)
  }
  return res
}
