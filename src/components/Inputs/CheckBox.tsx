import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  type?: 'checkbox' | 'radio'
  name?: string
  value?: string
  className?: MJ.ClassProp
  checked?: boolean
  disabled?: boolean
  onchange?: (event: Event) => void
  children?: MJ.Element
}

/**
 * チェックボックス
 */
export default class CheckBox extends MJComponent<Props> {
  createNode({ type = 'checkbox', name, value, className, checked, disabled, onchange, children }: Props) {
    return (
      <label class="flex items-center justify-end gap-2">
        <input type={type} name={name} value={value} checked={checked} class={className} disabled={disabled} onchange={onchange} />
        {children}
      </label>
    )
  }
}
