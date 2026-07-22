import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  name?: string
  type?: 'text' | 'number'
  value?: string | number
  rowIndex?: number
  className?: MJ.ClassProp
  onchange?: (event: Event) => void
}

/**
 * テーブルセル: テキスト入力
 */
export class CellText extends MJComponent<Props> {
  createNode({ name, type = 'text', value, rowIndex, className, onchange }: Props) {
    return (
      <div class={['data-grid-cell px-2 py-1', className]} data-row-index={rowIndex}>
        <input type={type} name={name} value={value} class="h-full w-full outline-hidden" onchange={onchange} />
      </div>
    )
  }
}
