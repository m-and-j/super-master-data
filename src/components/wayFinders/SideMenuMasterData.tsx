import { masterDataAccessor } from '@/systems/master-data-accessor'
import { SideMenuScroller } from '@/utilities/side-menu-scroller'
import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props {
  currentName?: string
  className?: MJ.ClassProp
}

/**
 * サイドメニュー(マスターデータ)
 */
export class SideMenuMasterData extends MJComponent<Props> {
  private sideMenuScroller = new SideMenuScroller('master-data')

  async beforeRender() {
    this.sideMenuScroller.initialize()
  }

  createNode({ currentName, className }: Props) {
    return (
      <div class={['scrollbar flex flex-col overflow-y-scroll border-r-3 border-zinc-500 p-2', className]} ref={this.sideMenuScroller.scrollRef}>
        {masterDataAccessor.getNames().map((name) => (
          <MJLink to={`/master-data/${name}`} className={['px-1 text-blue-500', name === currentName ? 'bg-zinc-700' : '']}>
            {name}
          </MJLink>
        ))}
        <div class="flex-auto" />
      </div>
    )
  }

  async afterRender() {
    this.sideMenuScroller.register()
  }
}
