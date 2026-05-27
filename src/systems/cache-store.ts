class CacheString {
  private name = ''
  constructor(name: string) {
    this.name = name
  }

  getValue() {
    return localStorage.getItem(this.name)
  }

  setValue(value: string) {
    localStorage.setItem(this.name, value)
  }

  remove() {
    localStorage.removeItem(this.name)
  }
}

class CacheNumber {
  private name = ''
  constructor(name: string) {
    this.name = name
  }

  getValue() {
    const value = localStorage.getItem(this.name)
    return value != null ? Number(value) : null
  }

  setValue(value: number) {
    localStorage.setItem(this.name, `${value}`)
  }

  remove() {
    localStorage.removeItem(this.name)
  }
}

/**
 * キャッシュ
 */
class CacheStore {
  private _theme: CacheString = new CacheString('super-master-data.theme')
  private _projectPath: CacheString = new CacheString('super-master-data.project-path')
  private _sideMenuScrollName: CacheString = new CacheString('super-master-data.side-menu-scroll-name')
  private _sideMenuScrollTop: CacheNumber = new CacheNumber('super-master-data.side-menu-scroll-top')

  get theme() {
    return this._theme
  }

  get projectPath() {
    return this._projectPath
  }

  get sideMenuScrollName() {
    return this._sideMenuScrollName
  }

  get sideMenuScrollTop() {
    return this._sideMenuScrollTop
  }
}

export const cacheStore = new CacheStore()
