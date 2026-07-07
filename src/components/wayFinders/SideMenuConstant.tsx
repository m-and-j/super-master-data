import { preferences } from '@/systems/preferences'
import { SideMenuScroller } from '@/utilities/side-menu-scroller'
import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
  className?: MJ.ClassProp
}

/**
 * サイドメニュー(定数グループ)
 */
export class SideMenuConstant extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('constant')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName, className }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/constants-edit-json'
    const jsonMode = location.pathname === '/constants-edit-json'
    return (
      <div class={['flex flex-col border-r-3 border-zinc-500', className]}>
        <div class="flex p-2">
          <MJLink to="/constants" className={['flex-auto px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
            新規定数グループ
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-134px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {projectInfo.constants.map((c) => (
            <MJLink to={`/constants/${c.name}`} className={['px-1 text-blue-500', c.name === currentName ? 'bg-zinc-700' : '']}>
              {c.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="border-zinc-500" />
        <div class="flex p-2">
          <MJLink to="/constants-edit-json" className={['flex-auto px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
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
