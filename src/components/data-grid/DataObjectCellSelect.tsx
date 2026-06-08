import { MJ, MJCustomElement } from '@mj/jsx'

export interface SelectItem {
  value: string
  label: string
  selected?: boolean
}

interface Props extends MJ.CEProps<DataObjectCellSelect> {
  items: SelectItem[]
  onchange?: (event: Event) => void
  onblur?: (event: Event) => void
}

/**
 * データオブジェクトテーブルセル: セレクトボックス
 */
export class DataObjectCellSelect extends MJCustomElement<Props>()(HTMLSelectElement) {
  connectedCallback() {
    const { onchange, onblur } = this.props
    this.addClassName('h-full w-[calc(100%-7px)] px-0.5 bg-zinc-800 outline-hidden hidden')
    this.addEventListener('change', (e) => onchange?.(e))
    this.addEventListener('blur', (e) => onblur?.(e))
  }

  createNode({ items }: Props) {
    return (
      <>
        {items.map(({ label, value, selected }) => (
          <option value={value} selected={selected}>
            {label}
          </option>
        ))}
      </>
    )
  }

  getSelectedValue() {
    return this.value
  }

  show() {
    this.classList.remove('hidden')
    this.focus()
  }

  hide() {
    this.classList.add('hidden')
  }
}
