import { MJ, MJComponent, Reference } from '@mj/jsx'

/**
 * 選択肢のアイテム
 */
export type OptionItemStringOrNumber = {
  value: string | number
  label: string
  selected?: boolean
}
export type OptionItemString = OptionItemStringOrNumber & { value: string }
export type OptionItemNumber = OptionItemStringOrNumber & { value: number }

interface Props {
  name?: string
  options: OptionItemStringOrNumber[]
  selectedValue?: string | number
  className?: MJ.ClassProp
  onchange?: (event: Event) => void
  selectBoxRef?: Reference<HTMLSelectElement>
}

/**
 * セレクトボックスフィールド
 */
export class SelectBox extends MJComponent<Props> {
  createNode({ name, options, selectedValue, className, onchange, selectBoxRef }: Props) {
    return (
      <select name={name} class={['w-full rounded-md border bg-zinc-100 px-2 py-2 dark:bg-zinc-800', className]} onchange={onchange} ref={selectBoxRef}>
        {options.map((option) => (
          <option value={option.value} selected={option?.selected ?? option.value === selectedValue}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
}
