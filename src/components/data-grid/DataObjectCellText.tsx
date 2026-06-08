import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<DataObjectCellText> {
  onchange?: (event: Event) => void
  onblur?: (event: Event) => void
}

/**
 * データオブジェクトテーブルセル: テキスト入力
 */
export class DataObjectCellText extends MJCustomElement<Props>()(HTMLInputElement) {
  connectedCallback() {
    const { onchange, onblur } = this.props
    this.addClassName('h-full w-full px-1.5 bg-zinc-800 outline-hidden hidden')
    this.type = 'text'
    this.addEventListener('change', (e) => onchange?.(e))
    this.addEventListener('blur', (e) => onblur?.(e))
  }

  createNode() {
    return null
  }

  setValue(value: string) {
    this.value = value
  }

  getValue() {
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
