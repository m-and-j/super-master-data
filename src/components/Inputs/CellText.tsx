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
export default class CellText extends MJComponent<Props> {
  createNode({ name, type = 'text', value, className, onchange }: Props) {
    return (
      <div class={['px-2 py-1 bg-zinc-800 border border-transparent', 'has-[input:focus]:border-blue-500', className]}>
        <input type={type} name={name} value={value} class="w-full h-full outline-hidden" onchange={onchange} />
      </div>
    )
  }
}
