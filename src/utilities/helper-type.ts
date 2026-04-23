export function toBoolean(value: unknown): boolean | undefined
export function toBoolean(value: unknown, defaultValue: boolean): boolean
export function toBoolean(value: unknown, defaultValue?: boolean): boolean | undefined

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

export function toNumber(value: any): number | undefined
export function toNumber(value: any, defaultValue: number): number
export function toNumber(value: any, defaultValue?: number): number | undefined

/**
 * 数値に変換する
 * Number()だと null や '' が 0 に、undefined が NaN に変換されるので、想定外の値を制御する
 * valueが数字に変換できない場合は defaultValue を返す
 * @param value
 * @param defaultValue
 * @returns
 */
export function toNumber(value: any, defaultValue?: number): number | undefined {
  if (typeof value === 'string' && value !== '') {
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  } else if (typeof value === 'boolean') {
    return value ? 1 : 0
  } else {
    return defaultValue
  }
}
