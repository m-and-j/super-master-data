import { InputVariantType, SizeType } from '@/utilities/defines'
import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  value?: string
  variant?: InputVariantType
  size?: SizeType
  rounded?: boolean
  className?: MJ.ClassProp
  id?: string
  form?: string
  disabled?: boolean
  onclick?: (event: MouseEvent) => void
  children?: MJ.Element
}

/**
 * ボタン
 */
export default class Button extends MJComponent<Props> {
  createNode({ type = 'button', value, variant, size = 'md', rounded, className, id, form, disabled, onclick, children }: Props) {
    const baseCss = []
    let denied = false
    let title
    if (variant) {
      baseCss.push('font-semibold focus:outline-none flex justify-center items-center gap-1 disabled:opacity-50')
      baseCss.push(size === 'none' ? '' : `element-size-${size}`)
      if (variant !== 'link' && variant !== 'clear') {
        baseCss.push(rounded ? 'rounded-full' : 'rounded-lg', `input-${variant}`)
      }
      if (!disabled && !denied) {
        baseCss.push('cursor-pointer')
      }
    }
    return (
      <button type={type} value={value} class={[baseCss, className]} form={form} disabled={disabled || denied} title={title} onclick={onclick} data-id={id}>
        {children}
      </button>
    )
  }
}
