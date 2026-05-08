import { MJ, MJComponent } from '@mj/jsx'

interface Props extends MJ.CEProps<TabItemButton> {
  name: string
  onchange: (name: string) => void
  defaultActive?: boolean
  children: MJ.Element
}

/**
 * タブバー(ボタン)
 */
export default class TabItemButton extends MJComponent<Props> {
  createNode({ name, defaultActive, children, onchange, className }: Props) {
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
          <div class="'flex leading-[1.875rem]' max-w-full focus:outline-hidden">
            <div class="mx-4 my-2 flex truncate">{children}</div>
          </div>
        </div>
      </label>
    )
  }

  async afterRender({ name, defaultActive, onchange }: Props) {
    if (defaultActive) {
      onchange(name)
    }
  }
}
