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

/**
 * 同一キーを加算するMap
 */
export class AdditionalMap<K> extends Map<K, number> {
  static create<K>(entries: [K, number][]): AdditionalMap<K> {
    const map = new AdditionalMap<K>()
    for (const [key, value] of entries) {
      map.add(key, value)
    }
    return map
  }

  add(key: K, value: number) {
    return super.set(key, this.get(key) + value)
  }

  get(key: K): number {
    return super.get(key) ?? 0
  }

  getKeys(): K[] {
    return Array.from(this.keys())
  }

  total(): number {
    return Array.from(this.values()).reduce((a, b) => a + b, 0)
  }

  merge(map: AdditionalMap<K>) {
    for (const [key, value] of map.entries()) {
      this.add(key, value)
    }
    return this
  }

  toArray(): [K, number][] {
    return [...this.entries()]
  }
}

export function arrayUnique<T>(...arrays: T[][]) {
  return Array.from(new Set(arrays.flat()))
}

export function arrayIntersect<T>(first: T[], ...arrays: T[][]) {
  const firstUnique = arrayUnique(first)
  const uniques = arrays.map((array) => new Set(array))
  return firstUnique.filter((value) => uniques.every((set) => set.has(value)))
}

/**
 * 配列の要素を置き換える
 * @param array
 * @param from
 * @param to
 * @returns
 */
export function arrayReplace<T>(array: T[], from: T, to: T) {
  if (from !== to) {
    const index = array.indexOf(from)
    if (index >= 0) {
      array.splice(index, 1, to)
      array.sort()
    }
  }
  return array
}

/**
 * 配列から要素を削除
 * @param array
 * @param value
 * @returns
 */
export function arrayRemove<T>(array: T[], value: T) {
  const index = array.indexOf(value)
  if (index >= 0) {
    array.splice(index, 1)
  }
  return array
}
