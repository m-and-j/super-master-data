import { MJ, MJComponent, Reference } from '@mj/jsx'

const variantClassNames = {
  primary: 'text-white bg-blue-700 border border-blue-700 enabled:hover:bg-blue-600 shadow-md',
  secondary: 'text-white bg-zinc-700 border border-zinc-700 enabled:hover:bg-zinc-600 shadow-md',
  success: 'text-white bg-green-700 border border-green-700 enabled:hover:bg-green-600 shadow-md',
  warning: 'text-white bg-amber-700 border border-amber-700 enabled:hover:bg-amber-600 shadow-md',
  danger: 'text-white bg-rose-700 border border-rose-700 enabled:hover:bg-rose-600 shadow-md',
  link: 'text-blue-600 underline',
} as const
type Variant = keyof typeof variantClassNames

const variantOutlineClassNames = {
  primary: 'text-blue-600 border border-blue-600 enabled:hover:bg-blue-950',
  secondary: 'text-zinc-300 border border-zinc-300 enabled:hover:bg-zinc-950',
  success: 'text-green-600 border border-green-600 enabled:hover:bg-green-950',
  warning: 'text-amber-600 border border-amber-600 enabled:hover:bg-amber-950',
  danger: 'text-rose-600 border border-rose-600 enabled:hover:bg-rose-950',
  link: 'text-blue-600 underline',
} as const

const sizeClassNames = {
  min: 'rounded-xs',
  sm: 'px-3 py-0.5 text-sm rounded',
  md: 'px-5 py-1.5 rounded-lg',
} as const
type Size = keyof typeof sizeClassNames

interface Props {
  type?: 'button' | 'submit' | 'reset'
  value?: string
  variant?: Variant
  outline?: boolean
  size?: Size
  className?: MJ.ClassProp
  form?: string
  disabled?: boolean
  onclick?: (event: MouseEvent) => void
  children?: MJ.Element
  ref?: Reference<HTMLButtonElement>
}

/**
 * ボタン
 */
export default class Button extends MJComponent<Props> {
  createNode({ type = 'button', value, variant, outline, size = 'md', className, form, disabled, onclick, children, ref }: Props) {
    let baseCss = ''
    let variantCss = ''
    let sizeCss = ''
    if (variant) {
      baseCss = 'font-semibold focus:outline-hidden flex justify-center items-center gap-1 cursor-pointer disabled:opacity-50'
      variantCss = outline ? variantOutlineClassNames[variant] : variantClassNames[variant]
      sizeCss = sizeClassNames[size]
    }
    return (
      <button type={type} value={value} class={[baseCss, variantCss, sizeCss, className]} form={form} disabled={disabled} onclick={onclick} ref={ref}>
        {children}
      </button>
    )
  }
}
