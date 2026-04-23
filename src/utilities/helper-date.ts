type DateSource = Date | string | number | FormDataEntryValue | undefined | null

/**
 * 日付をDate型に変換する
 * - 値がfalsyまたはInvalid Dateの場合はdefaultValueを返す
 * @param date
 * @param defaultValue
 * @returns
 */
export function toDate(date: DateSource, defaultValue: Date = new Date('Invalid Date')) {
  let d
  if (date instanceof Date) {
    d = date
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date)
  } else if (date) {
    d = new Date(date.toString())
  }
  return d && !isNaN(d.getTime()) ? d : defaultValue
}

interface DateMap {
  M: number
  d: number
  h: number
  m: number
  s: number
}

/**
 * 日付フォーマッター
 * @param date 日付
 * @param format 例) yyyy/MM/dd
 * @returns
 */
export function formatDate(date: DateSource, format: string) {
  const d = toDate(date)
  if (!isNaN(d.getTime())) {
    const symbol: DateMap = {
      M: d.getMonth() + 1,
      d: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),
    }
    const formatted = format.replace(/(M+|d+|h+|m+|s+)/g, (v) => {
      const key = v.slice(-1) as keyof DateMap
      const val = String(symbol[key] ?? '')
      return `${v.length > 1 ? '0' : ''}${val}`.slice(-2)
    })
    return formatted.replace(/(y+)/g, (v) => d.getFullYear().toString().slice(-v.length))
  } else {
    return '-'
  }
}

/**
 * 日時が最小値か
 * @param date
 * @returns
 */
export function isMinDate(date: DateSource): boolean {
  const d = toDate(date)
  return d.getFullYear() === 1970 && d.getMonth() === 0 && d.getDate() === 1 && d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0
}

/**
 * 日時が最大値か
 * @param date
 * @returns
 */
export function isMaxDate(date: DateSource): boolean {
  const d = toDate(date)
  return d.getFullYear() === 9999 && d.getMonth() === 11 && d.getDate() === 31 && d.getHours() === 23 && d.getMinutes() === 59 && d.getSeconds() === 59
}

/**
 * 期間が有効か
 * - `indefinitely: true`の場合、両方falsyまたは片方falsyの場合は「無期限」「開始日のみ」「終了日のみ」とみなすため`true`を返す
 * @param beginAt
 * @param endAt
 * @returns
 */
export function isPeriod(beginAt: DateSource, endAt: DateSource, { indefinitely = false } = {}) {
  const beginDate = toDate(beginAt)
  const endDate = toDate(endAt)
  if (indefinitely) {
    return isNaN(beginDate.getTime()) || isNaN(endDate.getTime()) || beginDate <= endDate
  } else {
    return beginDate <= endDate
  }
}

/**
 * 期間内判定
 * - `indefinitely: true`の場合、両方falsyまたは片方falsyの場合は「無期限」「開始日のみ」「終了日のみ」とみなすため`true`を返す
 * @param beginAt
 * @param endAt
 * @param target
 * @returns
 */
export function withinPeriod(beginAt: DateSource, endAt: DateSource, { target = new Date(), indefinitely = false } = {}) {
  const beginDate = toDate(beginAt)
  const endDate = toDate(endAt)
  if (indefinitely) {
    return isNaN(beginDate.getTime()) || isNaN(endDate.getTime()) || (target >= beginDate && target <= endDate)
  } else {
    return target >= beginDate && target <= endDate
  }
}
