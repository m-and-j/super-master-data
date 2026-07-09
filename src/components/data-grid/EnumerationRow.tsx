import { CellText } from '@/components/data-grid/CellText'
import { Button } from '@/components/inputs/Button'
import { ColumnParams } from '@/systems/define'
import { EnumerationStructItemRaw } from '@/systems/types'
import { MJComponent } from '@mj/jsx'

interface Props {
  item: EnumerationStructItemRaw
  index: number
  deleteRow: (index: number) => void
}

/**
 * 列挙型テーブル行
 */
export class EnumerationRow extends MJComponent<Props> {
  createNode({ item, index, deleteRow }: Props) {
    return (
      <>
        <CellText name={ColumnParams.Names} value={item.label} />
        <CellText name={ColumnParams.Values} value={item.value} type="number" />
        <CellText name={ColumnParams.Descriptions} value={item.description} />
        <div class="data-grid-cell">
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
