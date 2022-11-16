import { mulDiv } from './fullMath'

const Q96 = BigInt(2 ** 96)
const Q128 = BigInt(2 ** 128)

export function getLiquidityForAmount0(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, amount0: bigint) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  }

  const intermediate = mulDiv(sqrtRatioAX96, sqrtRatioBX96, Q96)
  return mulDiv(amount0, intermediate, BigInt(sqrtRatioBX96.toString()) - BigInt(sqrtRatioAX96.toString())) % Q128
}

export function getLiquidityForAmount1(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, amount1: bigint) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  }
  return mulDiv(amount1, Q96, BigInt(sqrtRatioBX96.toString()) - BigInt(sqrtRatioAX96.toString())) % Q128
}

export function getAmount0ForLiquidity(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, liquidity: bigint) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  }

  const diff = BigInt(sqrtRatioBX96.toString()) - BigInt(sqrtRatioAX96.toString())
  const res = mulDiv(BigInt(liquidity.toString()) << BigInt(96), diff, sqrtRatioBX96) / sqrtRatioAX96
  return res
}

export function getAmount1ForLiquidity(sqrtRatioAX96: bigint, sqrtRatioBX96: bigint, liquidity: bigint) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  }

  const diff = BigInt(sqrtRatioBX96.toString()) - BigInt(sqrtRatioAX96.toString())
  const res = mulDiv(liquidity, diff, Q96)
  return res
}
