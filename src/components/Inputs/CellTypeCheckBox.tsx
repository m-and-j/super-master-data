import { MJ, MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  label: string
  checked?: boolean
  className?: MJ.ClassProp
  onchange: (value: boolean) => void
}

/**
 * セルテーブル: チェックボックス
 */
export default class CellTypeCheckBox extends MJComponent<Props> {
  private input: Reference<HTMLInputElement> = ref()
  private span: Reference<HTMLSpanElement> = ref()

  createNode({ label, checked = false, className }: Props) {
    return (
      <div class={['px-2 py-1 bg-zinc-800 flex gap-2 border border-transparent', 'has-[label:focus]:border-blue-500', className]}>
        <label class="flex items-center gap-1 select-none outline-hidden" onclick={() => this.toggle()} tabindex={0}>
          <input type="hidden" value={checked ? '1' : '0'} ref={this.input} />
          <span class={['text-xl', checked ? 'icon-[ic--baseline-check-box]' : 'icon-[ic--baseline-check-box-outline-blank]']} ref={this.span}></span>
          {label}
        </label>
      </div>
    )
  }

  private toggle() {
    const { onchange } = this.props
    if (this.input.value && this.span.value) {
      if (this.input.value.value === '1') {
        this.input.value.value = '0'
        this.span.value.classList.replace('icon-[ic--baseline-check-box]', 'icon-[ic--baseline-check-box-outline-blank]')
        onchange(false)
      } else {
        this.input.value.value = '1'
        this.span.value.classList.replace('icon-[ic--baseline-check-box-outline-blank]', 'icon-[ic--baseline-check-box]')
        onchange(true)
      }
    }
  }
}
