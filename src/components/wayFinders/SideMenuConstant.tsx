import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
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
    return (
      <div class={['flex flex-col border-r-3 border-zinc-500', className]}>
        <div class="flex p-2">
          <MJLink to="/constants" className={['flex-auto px-1 text-blue-500', currentName ? '' : 'bg-zinc-700']}>
            新規定数グループ
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-94px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {masterConstantsAccessor.getNames().map((name) => (
            <MJLink to={`/constants/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
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
