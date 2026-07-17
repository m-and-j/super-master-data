import { cacheStore } from '@/systems/cache-store'
import { ref, Reference } from '@mj/jsx'

type Mode = 'table' | 'list-struct' | 'schema' | 'enum' | 'constant' | 'master-data' | 'list-data' | 'output'

/**
 * 左メニューのスクロールを保持する
 */
export class SideMenuScroller {
  private mode: Mode
  private ref: Reference<HTMLDivElement> = ref()

  constructor(mode: Mode) {
    this.mode = mode
  }

  get scrollRef() {
    return this.ref
  }

  initialize() {
    if (cacheStore.sideMenuScrollName.getValue() !== this.mode) {
      cacheStore.sideMenuScrollTop.remove()
    }
  }

  register() {
    requestAnimationFrame(() => this.moveScrollTop(cacheStore.sideMenuScrollTop.getValue() ?? 0))
    let timerId = 0
    this.ref.value?.addEventListener('scroll', () => {
      clearTimeout(timerId)
      timerId = setTimeout(() => {
        cacheStore.sideMenuScrollName.setValue(this.mode)
        cacheStore.sideMenuScrollTop.setValue(this.ref.value?.scrollTop ?? 0)
      }, 100)
    })
  }

  private moveScrollTop(top: number) {
    this.ref.value?.scroll({ top })
    if (this.ref.value?.scrollTop !== top) {
      requestAnimationFrame(() => this.moveScrollTop(top))
    }
  }
}
