import { MJ, MJComponent } from '@mj/jsx'

export interface SelectItem {
  value: string
  label: string
  selected?: boolean
}

interface Props {
  name?: string
  items: SelectItem[]
  className?: MJ.ClassProp
  onchange?: (event: Event) => void
}

/**
 * セルテーブル: セレクトボックス
 */
export default class CellTypeSelect extends MJComponent<Props> {
  createNode({ name, items, className, onchange }: Props) {
    return (
      <div class={['px-1 bg-zinc-800 flex gap-2 border border-transparent', 'has-[select:focus]:border-blue-500', className]}>
        <select class="w-full h-full bg-zinc-800 outline-hidden" name={name} onchange={onchange}>
          {items.map(({ label, value, selected }) => (
            <option value={value} selected={selected}>
              {label}
            </option>
          ))}
        </select>
      </div>
    )
  }
}
