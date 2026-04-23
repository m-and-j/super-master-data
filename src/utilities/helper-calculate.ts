/**
 * 範囲内に収まる値を返す
 * @param num
 * @param min
 * @param max
 * @returns
 */
export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max)
}

/**
 * 割引計算
 * @param price
 * @param pct
 * @returns
 */
export function discountPct(price: number, pct: number) {
  const absPct = Math.abs(pct)
  return Math.round((price * (100 - absPct)) / 100)
}
