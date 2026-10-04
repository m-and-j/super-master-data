import { enumerationAccessor } from '@/systems/accessors/enumeration-accessor'
import { SideMenuScroller } from '@/utilities/side-menu-scroller'
import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
  className?: MJ.ClassProp
}

/**
 * サイドメニュー(列挙型)
 */
export class SideMenuEnumeration extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('enum')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName, className }: Props) {
    return (
      <div class={['flex flex-col border-r-3 border-zinc-500', className]}>
        <div class="flex p-2">
          <MJLink to="/enumerations" className={['flex-auto px-1 text-blue-500', currentName ? '' : 'bg-zinc-700']}>
            新規列挙型
          </MJLink>
        </div>
        <hr class="border-zinc-500" />
        <div class="scrollbar flex h-[calc(100vh-94px)] flex-col overflow-y-scroll p-2" ref={this.sideMenuScroller.scrollRef}>
          {enumerationAccessor.map(({ name }) => (
            <MJLink to={`/enumerations/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
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
