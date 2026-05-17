import { formatCSS, MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

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
  private selectBox: Reference<HTMLSelectElement> = ref()

  async initialize({ className }: Props) {
    this.className = formatCSS(['data-grid-cell px-1 bg-zinc-800 flex gap-2', className])
  }

  createNode({ name, items, onchange }: Props) {
    return (
      <select class="h-full w-full bg-zinc-800 outline-hidden" name={name} onchange={onchange} ref={this.selectBox}>
        {items.map(({ label, value, selected }) => (
          <option value={value} selected={selected}>
            {label}
          </option>
        ))}
      </select>
    )
  }

  getSelectedValue() {
    return this.selectBox.value?.value
  }

  show() {
    this.classList.remove('hidden')
  }

  hide() {
    this.classList.add('hidden')
  }
}
