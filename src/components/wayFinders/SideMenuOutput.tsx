import { preferences } from '@/systems/preferences'
import { SideMenuScroller } from '@/utilities/side-menu-scroller'
import { MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
}

/**
 * サイドメニュー(出力)
 */
export class SideMenuOutput extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('output')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/outputs-edit-json'
    const jsonMode = location.pathname === '/outputs-edit-json'
    return (
      <div class="flex flex-[0_0_300px] flex-col border-r-3 border-zinc-500">
        <div class="flex p-2">
          <MJLink to="/outputs" className={['flex-auto px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
            新規出力設定
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-134px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {projectInfo.outputs.map((o) => (
            <MJLink to={`/outputs/${o.name}`} className={['px-1 text-blue-500', o.name === currentName ? 'bg-zinc-700' : '']}>
              {o.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="border-zinc-500" />
        <div class="flex p-2">
          <MJLink to="/outputs-edit-json" className={['flex-auto px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
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
