import { MJ, MJComponent } from '@mj/jsx'
import { MJLink } from '@mj/router'

interface Props extends MJ.CEProps<TabItemLink> {
  to: string
  defaultActive?: boolean
  children: MJ.Element
}

/**
 * タブバー(リンク)
 */
export default class TabItemLink extends MJComponent<Props> {
  createNode({ to, defaultActive, children, className }: Props) {
    return (
      <MJLink to={to} className={['flex max-w-52 rounded-t-md bg-zinc-500', className]}>
        <div
          class={[
            'mb-[1px] w-full truncate rounded-t-md bg-stone-100 p-[1px_1px_0_1px] dark:bg-zinc-800',
            defaultActive && 'm-[1px_1px_0_1px] p-[0_0_1px_0] [&>div]:text-blue-500',
          ]}
        >
          <div class="'flex leading-[1.875rem]' max-w-full focus:outline-hidden">
            <div class="mx-4 my-2 flex truncate">{children}</div>
          </div>
        </div>
      </MJLink>
    )
  }
}
