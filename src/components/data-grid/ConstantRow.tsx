import { CellText } from '@/components/data-grid/CellText'
import { Button } from '@/components/inputs/Button'
import { ColumnParams, ConstantKindOptions } from '@/systems/defines'
import { ConstantGroupItemRaw } from '@/systems/types'
import { MJComponent } from '@mj/jsx'

interface Props {
  item: ConstantGroupItemRaw
  index: number
  deleteRow: (index: number) => void
}

/**
 * 定数テーブル行
 */
export class ConstantRow extends MJComponent<Props> {
  createNode({ item, index, deleteRow }: Props) {
    const valueText = Array.isArray(item.value) ? JSON.stringify(item.value) : String(item.value ?? '')
    return (
      <>
        <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
        <CellText name={ColumnParams.Names} value={item.name} rowIndex={index} />
        <CellText name={ColumnParams.Labels} value={item.label} rowIndex={index} />
        <div class="data-grid-cell px-2 py-1" data-row-index={index}>
          <select name={ColumnParams.Types} class="h-full w-full bg-transparent outline-hidden">
            {ConstantKindOptions.map(({ label, value }) => (
              <option value={value} selected={value === item.type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <CellText name={ColumnParams.Values} value={valueText} rowIndex={index} />
        <div class="data-grid-cell" data-row-index={index}>
          <div class="m-1 flex justify-center">
            <Button variant="danger" size="none" className="flex-[0_0_40px]" onclick={() => deleteRow(index)}>
              <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
            </Button>
          </div>
        </div>
      </>
    )
  }
}
