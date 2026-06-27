/**
 * Format Number
 * @param value
 * @returns
 */
export function formatNumber(value: number | undefined | null) {
  if (value != null) {
    const formatter = new Intl.NumberFormat()
    return formatter.format(value)
  } else {
    return '-'
  }
}

/**
 * テキスト省略
 * @param text
 * @param length
 * @param options
 * @returns
 */
export function omitText(text: string | null | undefined, length: number, tail = '…') {
  if (text) {
    return text.length > length ? `${text.substring(0, length)}${tail}` : text
  } else {
    return '-'
  }
}

/**
 * シングルクォートエスケープ
 * @param str
 * @returns
 */
export function escapeSingleQuotes(str: string) {
  return str.replace(/'/g, "\\'")
}

/**
 * ダブルクォートエスケープ
 * @param str
 * @returns
 */
export function escapeDoubleQuotes(str: string) {
  return str.replace(/"/g, '\\"')
}

/**
 * 正規表現エスケープ
 * @param str
 * @returns
 */
export function regulationEscape(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
