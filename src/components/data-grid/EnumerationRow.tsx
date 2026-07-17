import { CellText } from '@/components/data-grid/CellText'
import { Button } from '@/components/inputs/Button'
import { ColumnParams } from '@/systems/defines'
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
    const bgColor = index % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800'
    return (
      <>
        <CellText className={bgColor} name={ColumnParams.Names} value={item.label} />
        <CellText className={bgColor} name={ColumnParams.Values} value={item.value} type="number" />
        <CellText className={bgColor} name={ColumnParams.Descriptions} value={item.description} />
        <div class={['data-grid-cell', bgColor]}>
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
