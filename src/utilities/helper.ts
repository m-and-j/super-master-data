import { readFile, writeFile } from '@tauri-apps/plugin-fs'

/**
 * パスからファイル名を取得する
 * @param path
 * @returns
 */
export function basename(path: string | undefined | null) {
  return path != null ? path.replace(/^.*[\\\/]/, '') : ''
}

/**
 * パスからフォルダ名を取得する
 * @param path
 * @returns
 */
export function dirname(path: string | undefined | null) {
  return path != null ? path.replace(/[\\\/][^\\\/]*$/, '') : ''
}

/**
 * 条件が満たされる時に値を返す
 * @param val
 * @param check
 * @returns
 */
export function when<T>(val: T, check: boolean): T | undefined {
  return check ? val : undefined
}

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
 * オブジェクトのディープコピー
 * @param obj
 * @returns
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * JSON文字列をオブジェクトに変換する
 * @param value
 * @returns
 */
export function tryParseJSON<T>(value?: string | null): T | undefined {
  if (value) {
    try {
      return JSON.parse(value) as T
    } catch (e) {
      return undefined
    }
  } else {
    return undefined
  }
}

/**
 * JSONファイルを読み込んでオブジェクトを出力する
 * @param value
 * @returns
 */
export async function readJsonFile<T>(path: string): Promise<T> {
  const contents = await readFile(path)
  const dataString = new TextDecoder().decode(contents)
  return JSON.parse(dataString) as T
}

/**
 * JSONファイルを読み込んでオブジェクトを出力する
 * @param value
 * @returns
 */
export async function writeJsonFile<T>(data: T, path: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const dataString = new TextEncoder().encode(jsonString)
  await writeFile(path, dataString)
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
    if (aPart === undefined) {
      return -1
    } else if (bPart === undefined) {
      return 1
    } else {
      const aNum = parseInt(aPart, 10)
      const bNum = parseInt(bPart, 10)
      const bothAreNumbers = !isNaN(aNum) && !isNaN(bNum)

      if (bothAreNumbers) {
        if (aNum !== bNum) {
          return aNum - bNum
        }
      } else {
        if (aPart !== bPart) {
          return aPart.localeCompare(bPart)
        }
      }
    }
  }
  return 0
}
