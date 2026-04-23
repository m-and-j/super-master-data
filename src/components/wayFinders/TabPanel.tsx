import TabItem from '@/components/wayFinders/TabItem'
import { MouseButtonCode } from '@/systems/define'
import { MJ, MJComponent, ref, Reference } from '@mj/jsx'
import { MJRouter } from '@mj/router'

interface Props {
  children?: MJ.Element
}

/**
 * タブパネル
 */
export default class TabPanel extends MJComponent<Props> {
  private static _instance: TabPanel
  static get instance() {
    if (this._instance) {
      return this._instance
    } else {
      throw new Error('TabPanel is not being used.')
    }
  }
  private histories: Set<string> = new Set([location.pathname])

  constructor(props: Props) {
    super(props)
    TabPanel._instance = this
    window.addEventListener('popstate', () => this.reset())
  }

  private nav: Reference<HTMLDivElement> = ref()

  createNode({ children }: Props) {
    return (
      <div class="flex items-end flex-nowrap">
        <nav class="flex items-end flex-nowrap" ref={this.nav}>
          {children}
        </nav>
        <div class="flex-auto border-b border-zinc-500"></div>
      </div>
    )
  }

  async append(path: string, title: string) {
    this.histories.add(path)
    this.nav.value?.appendChild(await TabItem.createCustomElement({ path, children: title }))
  }

  remove(e: MouseEvent, tabItem: TabItem) {
    if (e.button === MouseButtonCode.Middle && tabItem.canErase()) {
      const path = tabItem.getPath()
      this.nav.value?.removeChild(tabItem)
      this.histories.delete(path)
      if (path === location.pathname) {
        const prev = Array.from(this.histories)[this.histories.size - 1]
        MJRouter.instance.push(prev)
      }
    }
  }

  private reset() {
    const path = location.pathname
    this.histories.delete(path)
    this.histories.add(path)
    const tabItems = this.nav.value?.querySelectorAll<TabItem>(TabItem.domName) ?? []
    for (const tabItem of tabItems) {
      if (tabItem.getRegex().test(path)) {
        tabItem.check()
        return
      }
    }
  }
}
