/**
 * パスからファイル名を取得する
 * @param path
 * @returns
 */
export function basename(path: string | undefined | null) {
  return path != null ? path.replace(/^.*[\\\/]/, '') : ''
}

export function dirname(path: string | undefined | null) {
  return path != null ? path.replace(/[\\\/][^\\\/]*$/, '') : ''
}

export function toBoolean(value: unknown): boolean | undefined
export function toBoolean(value: unknown, defaultValue: boolean): boolean

/**
 * 肯定と否定の文言を論理型に変換する
 * @param value
 * @param defaultValue
 * @returns
 */
export function toBoolean(value: unknown, defaultValue?: boolean): boolean | undefined {
  switch (value) {
    case true:
    case 'true':
    case '1':
    case 'yes':
    case 'on':
    case 1: {
      return true
    }
    case false:
    case 'false':
    case '0':
    case 'no':
    case 'off':
    case 0: {
      return false
    }
    default:
      return defaultValue
  }
}

export function toNumber(value: string | undefined | null): number | undefined
export function toNumber(value: string | undefined | null, defaultValue: number): number

/**
 * 文字列を数値に変換する
 * Number()だと null や '' が 0 に、undefined が NaN に変換されるので、想定外の値を制御する
 * valueが数字の文字列以外なら、defaultValue を返す
 * @param value
 * @param defaultValue
 * @returns
 */
export function toNumber(value: string | undefined | null, defaultValue?: number): number | undefined {
  if (value) {
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  } else {
    return defaultValue
  }
}

/**
 * 範囲内に収まる値を返す
 * @param num
 * @param min
 * @param max
 * @returns
 */
export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

/**
 * 特定のプリミティブ値を列挙型にキャストする
 * @param value
 * @returns
 */
export function autoCast<T>(value: string | number): T {
  const num = Number(value)
  if (isNaN(num)) {
    return value as T
  } else {
    return num as T
  }
}

/**
 * 特定のプリミティブ値を列挙型にキャストする(Undefined許容)
 * @param value
 * @returns
 */
export function autoCastOrUndefined<T>(value: string | number | undefined): T | undefined {
  if (value != null) {
    return autoCast(value)
  } else {
    return value
  }
}

/**
 * Number Format
 * @param value
 * @returns
 */
export function numberFormat(value: number | undefined | null) {
  if (value != null) {
    const formatter = new Intl.NumberFormat()
    return formatter.format(value)
  } else {
    return '-'
  }
}

/**
 * 正しいDate値であるか
 * @param date
 * @returns
 */
export function isValidDate(date: Date | undefined | null) {
  if (date) {
    return !isNaN(date.getTime())
  } else {
    return false
  }
}

export function toValidDate(date: string | undefined | null): Date | undefined
export function toValidDate(date: string | undefined | null, defaultValue: Date): Date

export function toValidDate(date: string | undefined | null, defaultValue?: Date) {
  if (date) {
    const d = new Date(date)
    if (isValidDate(d)) {
      return d
    }
  }
  return defaultValue
}

interface DateMap {
  M: number
  d: number
  h: number
  m: number
  s: number
}
const formatDate = (date: Date | undefined | null, format: string) => {
  if (date && !isNaN(date.getTime())) {
    const symbol: DateMap = {
      M: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds(),
    }
    const formatted = format.replace(/(M+|d+|h+|m+|s+)/g, (v) => {
      const key = v.slice(-1) as keyof DateMap
      const val = String(symbol[key] ?? '')
      return `${v.length > 1 ? '0' : ''}${val}`.slice(-2)
    })
    return formatted.replace(/(y+)/g, (v) => date.getFullYear().toString().slice(-v.length))
  } else {
    return '-'
  }
}

/**
 * 日付フォーマッター
 * @param date 日付
 * @param format 例) yyyy/MM/dd
 * @returns
 */
export function dateFormatter(date: Date | string | undefined | null, format: string) {
  if (typeof date === 'string') {
    return formatDate(new Date(date), format)
  } else {
    return formatDate(date, format)
  }
}

/**
 * 正規表現エスケープ
 * @param str
 * @returns
 */
export function regulationEscape(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 同一キーをリストで管理するクラス
 */
export class CollectionMap<K, V> extends Map<K, V[]> {
  public add(key: K, ...value: V[]) {
    const list = super.get(key)
    if (list) {
      list.push(...value)
    } else {
      super.set(key, [...value])
    }
    return this
  }

  public get(key: K): V[] {
    return super.get(key) ?? []
  }
}

export function camelToSnakeCase(value: Record<string, any>): Record<string, any>
export function camelToSnakeCase(value: string): string

/**
 * キャメルケースからスネークケースに変換
 * @param val
 * @returns
 */
export function camelToSnakeCase(value: string | Record<string, any>) {
  if (typeof value === 'string') {
    return value
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
      .toLowerCase()
  } else if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [camelToSnakeCase(key), val]))
  }
}

/**
 * スネークケースからキャメルケースに変換
 * @param value
 * @returns
 */
export function snakeToCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * キャメルケースからケバブケースに変換
 * @param value
 * @returns
 */
export function camelToKebabCase(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Base64エンコード
 * @param str
 * @returns
 */
export function encodeBase64(str: string) {
  return btoa(String.fromCharCode(...Array.from(new TextEncoder().encode(str))))
}

/**
 * Base64デコード
 * @param str
 * @returns
 */
export function decodeBase64(str: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(str), (c) => c.charCodeAt(0)))
}

/**
 * Natural Sort(Windows風ソート)
 * @param a
 * @param b
 * @returns
 */
export function naturalSort(a: string, b: string): number {
  const regex = /(\d+)|(\D+)/g
  const aParts = a.match(regex)!
  const bParts = b.match(regex)!
  const len = Math.max(aParts.length, bParts.length)
  for (let i = 0; i < len; i++) {
    const aPart = aParts[i]
    const bPart = bParts[i]
    if (aPart === undefined) return -1
    if (bPart === undefined) return 1

    const aNum = parseInt(aPart, 10)
    const bNum = parseInt(bPart, 10)
    const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum)

    if (bothAreNumbers) {
      if (aNum !== bNum) return aNum - bNum
    } else {
      if (aPart !== bPart) return aPart.localeCompare(bPart)
    }
  }
  return 0
}
