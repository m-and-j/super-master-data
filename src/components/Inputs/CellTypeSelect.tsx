import { formatCSS, MJ, MJCustomElement } from '@mj/jsx'

export interface SelectItem {
  value: string
  label: string
  selected?: boolean
}

interface Props extends MJ.CEProps<CellTypeSelect> {
  name?: string
  items: SelectItem[]
  onchange?: (event: Event) => void
}

/**
 * セルテーブル: セレクトボックス
 */
export default class CellTypeSelect extends MJCustomElement<Props>()(HTMLDivElement) {
  async initialize({ className }: Props) {
    this.className = formatCSS(['px-1 bg-zinc-800 flex gap-2 border border-transparent', 'has-[select:focus]:border-blue-500', className])
  }

  createNode({ name, items, onchange }: Props) {
    return (
      <select class="w-full h-full bg-zinc-800 outline-hidden" name={name} onchange={onchange}>
        {items.map(({ label, value, selected }) => (
          <option value={value} selected={selected}>
            {label}
          </option>
        ))}
      </select>
    )
  }

  show() {
    this.classList.remove('hidden')
  }

  hide() {
    this.classList.add('hidden')
  }
}
