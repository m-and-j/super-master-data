import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  type?: 'checkbox' | 'radio'
  name?: string
  value?: string
  labelClassName?: MJ.ClassProp
  checkBoxClassName?: MJ.ClassProp
  checked?: boolean
  disabled?: boolean
  onchange?: (event: Event) => void
  children?: MJ.Element
}

/**
 * チェックボックス
 */
export default class CheckBox extends MJComponent<Props> {
  createNode({ type = 'checkbox', name, value, labelClassName, checkBoxClassName, checked, disabled, onchange, children }: Props) {
    return (
      <label class={['flex gap-2', labelClassName]}>
        <input type={type} name={name} value={value} checked={checked} class={checkBoxClassName} disabled={disabled} onchange={onchange} />
        {children}
      </label>
    )
  }
}
