import { tryParseJSON } from '@/utilities/helper'
import { toDate } from '@/utilities/helper-date'
import { toBoolean, toNumber } from '@/utilities/helper-type'

export class FormDataEx extends FormData {
  constructor(event: SubmitEvent) {
    super(event.target as HTMLFormElement)
  }

  getValue<T>(name: string): T | undefined
  getValue<T>(name: string, defaultValue: T): T
  getValue<T>(name: string, defaultValue?: T): T | undefined {
    return (super.get(name) ?? defaultValue) as T
  }
  getValueNoempty<T>(name: string): T | undefined
  getValueNoempty<T>(name: string, defaultValue: T): T
  getValueNoempty<T>(name: string, defaultValue?: T): T | undefined {
    return (super.get(name) || defaultValue) as T
  }

  getString(name: string): string | undefined
  getString(name: string, defaultValue: string): string
  getString(name: string, defaultValue?: string): string | undefined {
    return (super.get(name) as string) ?? defaultValue
  }
  getStringNoempty(name: string): string | undefined
  getStringNoempty(name: string, defaultValue: string): string
  getStringNoempty(name: string, defaultValue?: string): string | undefined {
    return (super.get(name) as string) || defaultValue
  }

  getStringAll(name: string): string[] {
    return super.getAll(name) as string[]
  }

  getNumber(name: string): number | undefined
  getNumber(name: string, defaultValue: number): number
  getNumber(name: string, defaultValue?: number): number | undefined {
    return toNumber(super.get(name), defaultValue)
  }

  getNumberAll(name: string): number[] {
    return super.getAll(name).map(Number)
  }

  getBoolean(name: string): boolean | undefined
  getBoolean(name: string, defaultValue: boolean): boolean
  getBoolean(name: string, defaultValue?: boolean): boolean | undefined {
    return toBoolean(super.get(name), defaultValue)
  }

  getDateTime(name: string): number | undefined
  getDateTime(name: string, defaultValue: Date): number
  getDateTime(name: string, defaultValue?: Date): number | undefined {
    const time = toDate(super.get(name), defaultValue).getTime()
    return isNaN(time) ? undefined : time
  }
}

/**
 * オブジェクトをクエリパラメータで保持できるようエンコードする
 * @param params
 * @returns
 */
export function encodeQueryParams(params: object) {
  return encodeURIComponent(JSON.stringify(params))
}

/**
 * エンコードしたオブジェクトのクエリパラメータをデコードする
 * @param source
 * @returns
 */
export function decodeQueryParams<T>(source: string | null): T | undefined {
  if (source) {
    return tryParseJSON<T>(decodeURIComponent(source))
  } else {
    return undefined
  }
}

/**
 * JSONをダウンロードする
 * @param filename
 * @param data
 */
export function downloadJson(filename: string, data: object) {
  const body = JSON.stringify(data, null, 2)
  const blob = new Blob([body], { type: 'text/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
