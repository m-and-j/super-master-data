import { ScrollArea } from '@/components/viewers/ScrollArea'
import { MouseButtonCode } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { MJ, MJCustomElement } from '@mj/jsx'
import { MJRouter } from '@mj/router'

type NavigationTabDestination = {
  path: string
  group?: string
  title?: string
  icon?: string
  defaultActive?: boolean
  unerasable?: boolean
  always?: boolean
}

interface Props extends MJ.CEProps<NavigationTab> {
  destinations: NavigationTabDestination[]
}

/**
 * ナビゲーションタブ
 */
export class NavigationTab extends MJCustomElement<Props>()(HTMLDivElement) {
  private static _instance: NavigationTab
  static get instance() {
    if (this._instance) {
      return this._instance
    } else {
      throw new Error('TabPanel is not being used.')
    }
  }
  private destinations: Map<string, NavigationTabDestination> = new Map()
  private histories: Set<string> = new Set([location.pathname])

  constructor(props: Props) {
    super(props)
    NavigationTab._instance = this
    window.addEventListener('popstate', () => {
      const path = location.pathname
      this.histories.delete(path)
      this.histories.add(path)
      this.render()
    })
  }

  async initialize(_props: Props) {
    for (const destination of _props.destinations) {
      this.destinations.set(destination.path, destination)
    }
  }

  connectedCallback() {
    this.addClassName('flex')
  }

  createNode() {
    const destinations = Array.from(this.destinations.values()).filter((d) => d.always || preferences.existsProject())
    return (
      <ScrollArea x className="flex-auto">
        <div class="flex flex-nowrap items-end">
          <nav class="flex flex-nowrap items-end">
            {destinations.map(({ path, group, title, icon, defaultActive }) => (
              <label class="flex max-w-52 rounded-t-md bg-zinc-500" onmousedown={(e) => this.closeTab(e, path)}>
                <input type="radio" name="tab" class="peer hidden" checked={defaultActive ?? this.isActive(path, group)} onclick={() => MJRouter.instance.push(path)} />
                <div
                  class={[
                    'w-max-full mb-[1px] truncate rounded-t-md bg-zinc-800 p-[1px_1px_0_1px]',
                    'peer-checked:m-[1px_1px_0_1px] peer-checked:p-[0_0_1px_0]',
                    'peer-checked:[&>div]:text-blue-500',
                  ]}
                >
                  <div class="'flex leading-[1.875rem]' max-w-full focus:outline-hidden">
                    <div class="mx-4 my-2 flex truncate">
                      <div class="flex items-center gap-1">
                        {icon && <span class={icon}></span>}
                        {title}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </nav>
          <div class="flex-auto border-b border-zinc-500"></div>
        </div>
      </ScrollArea>
    )
  }

  async appendTab(destination: NavigationTabDestination) {
    this.destinations.set(destination.path, destination)
    this.histories.add(destination.path)
    MJRouter.instance.push(destination.path)
  }

  async removeTab(path: string) {
    const destination = this.destinations.get(path)
    if (destination && !destination.unerasable) {
      this.destinations.delete(path)
      this.histories.delete(path)
      if (path === location.pathname) {
        const prev = Array.from(this.histories)[this.histories.size - 1]
        MJRouter.instance.push(prev)
      }
      await this.render()
    }
  }

  private isActive(path: string, group?: string) {
    if (group) {
      return location.pathname.startsWith(group)
    } else {
      return location.pathname === path
    }
  }

  private async closeTab(e: MouseEvent, path: string) {
    if (e.button === MouseButtonCode.Middle) {
      await this.removeTab(path)
    }
  }
}
