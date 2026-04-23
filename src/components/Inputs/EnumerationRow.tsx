import Button from '@/components/inputs/Button'
import CellText from '@/components/inputs/CellText'
import { ColumnParams } from '@/systems/define'
import { EnumerationItem } from '@/systems/types'
import { MJComponent, Reference } from '@mj/jsx'

interface Props {
  item?: EnumerationItem
  tableDiv: Reference<HTMLDivElement>
}

/**
 * 列挙型テーブル行
 */
export default class EnumerationRow extends MJComponent<Props> {
  createNode({ item }: Props) {
    return (
      <div class="flex gap-[1px]">
        <CellText className="flex-[0_0_300px]" name={ColumnParams.Names} value={item?.label} />
        <CellText className="flex-[0_0_578px]" name={ColumnParams.Values} value={item?.value} type="number" />
        <CellText className="flex-auto" name={ColumnParams.Descriptions} value={item?.description} />
        <Button className="flex-[0_0_50px]" variant="danger" size="none" onclick={() => this.deleteRow()}>
          <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
        </Button>
      </div>
    )
  }

  deleteRow() {
    const { tableDiv } = this.props
    tableDiv.value?.removeChild(this.node as Node)
  }
}
