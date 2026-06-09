import { MJ, MJComponent } from '@mj/jsx'

interface Props {
  type?: 'text' | 'search'
  name?: string
  value?: string
  placeholder?: string
  tabindex?: number
  className?: MJ.ClassProp
  onchange?: (event: Event) => void
  oncontextmenu?: (event: MouseEvent) => void
}

/**
 * テキスト入力フィールド
 */
export class InputText extends MJComponent<Props> {
  createNode({ type = 'text', name, value, placeholder, tabindex, className, onchange, oncontextmenu }: Props) {
    return (
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        tabindex={tabindex}
        class={['w-full rounded-md border border-zinc-500 bg-zinc-800 px-2 py-1.75', className]}
        oncontextmenu={oncontextmenu}
        onchange={onchange}
      />
    )
  }
}
