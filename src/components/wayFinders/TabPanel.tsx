import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  className?: MJ.ClassProp
  children?: MJ.Element
}

/**
 * タブパネル
 */
export class TabPanel extends MJComponent<Props> {
  createNode({ className, children }: Props) {
    return (
      <div class={['flex flex-nowrap items-end', className]}>
        <nav class="flex h-12 flex-nowrap items-stretch">{children}</nav>
        <div class="flex-auto border-b border-zinc-500"></div>
      </div>
    )
  }
}
