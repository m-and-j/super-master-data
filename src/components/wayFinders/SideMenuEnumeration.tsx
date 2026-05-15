import preferences from '@/systems/preferences'
import SideMenuScroller from '@/utilities/side-menu-scroller'
import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
  className?: MJ.ClassProp
}

/**
 * サイドメニュー(列挙型)
 */
export default class SideMenuEnumeration extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('enum')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName, className }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const newMode = !currentName && location.pathname !== '/enumerations-edit-json'
    const jsonMode = location.pathname === '/enumerations-edit-json'
    return (
      <div class={['flex flex-col border-r-3 border-zinc-500', className]}>
        <div class="flex p-2">
          <MJLink to="/enumerations" className={['flex-auto px-1 text-blue-500', newMode ? 'bg-zinc-700' : '']}>
            新規列挙型
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-134px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {projectInfo.enumerations.map((e) => (
            <MJLink to={`/enumerations/${e.name}`} className={['px-1 text-blue-500', e.name === currentName ? 'bg-zinc-700' : '']}>
              {e.name}
            </MJLink>
          ))}
          <div class="flex-auto" />
        </div>
        <hr class="border-zinc-500" />
        <div class="flex p-2">
          <MJLink to="/enumerations-edit-json" className={['flex-auto px-1 text-blue-500', jsonMode ? 'bg-zinc-700' : '']}>
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
