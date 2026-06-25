import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

type Props = {
  className?: MJ.ClassProp
  children: MJ.Element
} & (
  | {
      type: 'change'
      name: string
      onchange: (name: string) => void
      defaultActive?: boolean
    }
  | {
      type: 'link'
      to: string
      defaultActive?: boolean
    }
  | {
      type: 'button'
      onclick: () => void
    }
)

/**
 * タブ項目
 */
export class TabItem extends MJComponent<Props> {
  createNode({ children, className }: Props) {
    switch (this.props.type) {
      case 'change': {
        const { name, onchange, defaultActive } = this.props
        return (
          <label class={['flex max-w-52 rounded-t-md bg-zinc-500', className]}>
            <input type="radio" name="tab" class="peer hidden" checked={defaultActive} onchange={() => onchange(name)} />
            <div
              class={[
                'mb-[1px] w-full truncate rounded-t-md bg-stone-100 p-[1px_1px_0_1px] dark:bg-zinc-800',
                'peer-checked:m-[1px_1px_0_1px] peer-checked:p-[0_0_1px_0]',
                'peer-checked:[&>div]:text-blue-500',
              ]}
            >
              <div class="flex max-w-full leading-[1.875rem] focus:outline-hidden">
                <div class="mx-4 my-2 flex truncate">{children}</div>
              </div>
            </div>
          </label>
        )
      }
      case 'link': {
        const { to, defaultActive } = this.props
        return (
          <MJLink to={to} className={['flex max-w-52 rounded-t-md bg-zinc-500', className]}>
            <div
              class={[
                'mb-[1px] w-full truncate rounded-t-md bg-stone-100 p-[1px_1px_0_1px] dark:bg-zinc-800',
                defaultActive && 'm-[1px_1px_0_1px] p-[0_0_1px_0] [&>div]:text-blue-500',
              ]}
            >
              <div class="flex max-w-full leading-[1.875rem] focus:outline-hidden">
                <div class="mx-4 my-2 flex truncate">{children}</div>
              </div>
            </div>
          </MJLink>
        )
      }
      case 'button': {
        const { onclick } = this.props
        return (
          <button type="button" class={['flex max-w-52 rounded-t-md bg-zinc-500', className]} onclick={() => onclick()}>
            <div class="mb-[1px] w-full truncate rounded-t-md bg-stone-100 p-[1px_1px_0_1px] dark:bg-zinc-800">
              <div class="flex max-w-full leading-[1.875rem] focus:outline-hidden">
                <div class="mx-4 my-2 flex truncate">{children}</div>
              </div>
            </div>
          </button>
        )
      }
    }
  }

  async afterRender(_props: Props) {
    if (this.props.type === 'change') {
      const { name, defaultActive, onchange } = this.props
      if (defaultActive) {
        onchange(name)
      }
    }
  }
}
