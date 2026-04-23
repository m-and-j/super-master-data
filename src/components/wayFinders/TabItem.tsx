import TabPanel from '@/components/wayFinders/TabPanel'
import { regulationEscape } from '@/utilities/helper-text'
import { formatCSS, MJ, MJCustomElement, ref, Reference } from '@mj/jsx'
import { MJRouter } from '@mj/router'

interface Props extends MJ.CEProps<TabItem> {
  path: string
  group?: string
  defaultActive?: boolean
  unerasable?: boolean
}

/**
 * タブバー
 */
export default class TabItem extends MJCustomElement<Props>()(HTMLLabelElement) {
  private radio: Reference<HTMLInputElement> = ref()
  private labelDiv: Reference<HTMLDivElement> = ref()
  private path?: string

  connectedCallback() {
    this.path = this.props.path
    this.className = formatCSS(['bg-zinc-500 rounded-t-md flex max-w-52', this.className])
    this.onmousedown = (e: MouseEvent) => TabPanel.instance.remove(e, this)
  }

  createNode({ defaultActive, children }: Props) {
    return (
      <>
        <input
          type="radio"
          name="tab"
          class="hidden peer"
          checked={defaultActive ?? this.getRegex().test(location.pathname)}
          onclick={() => MJRouter.instance.push(this.path ?? '')}
          ref={this.radio}
        />
        <div
          class={[
            'bg-zinc-800 rounded-t-md mb-[1px] p-[1px_1px_0_1px] w-max-full truncate',
            'peer-checked:m-[1px_1px_0_1px] peer-checked:p-[0_0_1px_0]',
            'peer-checked:[&>div]:text-blue-500',
          ]}
        >
          <div class="'flex max-w-full focus:outline-hidden leading-[1.875rem]'">
            <div class="mx-4 my-2 truncate flex" ref={this.labelDiv}>
              {children}
            </div>
          </div>
        </div>
      </>
    )
  }

  getPath() {
    return this.path ?? ''
  }

  getRegex() {
    const { group, path } = this.props
    if (group) {
      return new RegExp(`^${regulationEscape(group)}`)
    } else {
      return new RegExp(`^${regulationEscape(this.path ?? path)}$`)
    }
  }

  setPath(path: string, titleRefresh?: boolean) {
    this.path = path
    if (titleRefresh && this.labelDiv.value) {
      const urlPathSegments = path.split('/')
      const filePath = decodeURIComponent(urlPathSegments[urlPathSegments.length - 1])
      const filePathSegments = filePath.split('\\')
      this.labelDiv.value.textContent = filePathSegments[filePathSegments.length - 1]
    }
  }

  canErase() {
    return !this.props.unerasable
  }

  check() {
    if (this.radio.value) {
      this.radio.value.checked = true
    }
  }
}
