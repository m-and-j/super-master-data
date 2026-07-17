import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  name?: string
  type?: 'text' | 'number'
  value?: string | number
  className?: MJ.ClassProp
  onchange?: (event: Event) => void
}

/**
 * テーブルセル: テキスト入力
 */
export class CellText extends MJComponent<Props> {
  createNode({ name, type = 'text', value, className, onchange }: Props) {
    return (
      <div class={['data-grid-cell px-2 py-1', className]}>
        <input type={type} name={name} value={value} class="h-full w-full outline-hidden" onchange={onchange} />
      </div>
    )
  }
}
