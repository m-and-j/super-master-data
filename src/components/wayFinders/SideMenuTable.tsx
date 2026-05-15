import masterData from '@/systems/master-data'
import SideMenuScroller from '@/utilities/side-menu-scroller'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(テーブル)
 */
export default class SideMenuTable extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('table')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName }: Props) {
    const newMode = !currentName && location.pathname !== '/tables-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500">
        <div class="flex p-2">
          <MJLink to="/tables" className={['flex-auto px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
            新規テーブル
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-94px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {masterData.getNames().map((name) => (
            <MJLink to={`/tables/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
              {name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
      </div>
    )
  }

  async afterRender() {
    this.sideMenuScroller.register()
  }
}
