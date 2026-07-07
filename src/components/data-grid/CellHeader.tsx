import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  className?: MJ.ClassProp
  children?: MJ.Element
}

/**
 * テーブルセル: ヘッダー
 */
export class CellHeader extends MJComponent<Props> {
  createNode({ className, children }: Props) {
    return <div class={['data-grid-header sticky top-0 z-10 flex items-center gap-1 bg-zinc-600 px-2 py-1', className]}>{children}</div>
  }
}
