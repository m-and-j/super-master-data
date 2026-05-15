import preferences from '@/systems/preferences'
import SideMenuScroller from '@/utilities/side-menu-scroller'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(スキーマ)
 */
export default class SideMenuSchema extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('schema')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/schemas-edit-json'
    const jsonMode = location.pathname === '/schemas-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500">
        <div class="flex p-2">
          <MJLink to="/schemas" className={['flex-auto px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
            新規スキーマ
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-134px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {projectInfo.schemas.map((s) => (
            <MJLink to={`/schemas/${s.name}`} className={['px-1 text-blue-500', s.name === currentName ? 'bg-zinc-700' : '']}>
              {s.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="border-zinc-500" />
        <div class="flex p-2">
          <MJLink to="/schemas-edit-json" className={['flex-auto px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
            JSON編集
          </MJLink>
        </div>
      </div>
    )
  }

  async afterRender() {
    this.sideMenuScroller.register()
  }
}
