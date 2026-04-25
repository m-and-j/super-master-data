import CellHeader from '@/components/inputs/CellHeader'
import EnumerationRow from '@/components/inputs/EnumerationRow'
import { EnumerationItem } from '@/systems/types'
import { MJ, MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  items?: EnumerationItem[]
  className?: MJ.ClassProp
  ref?: Reference<EnumerationTable>
}

/**
 * 列挙型テーブル
 */
export default class EnumerationTable extends MJComponent<Props> {
  private tableDiv: Reference<HTMLDivElement> = ref()

  constructor(props: Props) {
    super(props)
    props.ref?.set(this)
  }

  createNode({ items, className }: Props) {
    return (
      <div class={['flex flex-col gap-[1px] bg-zinc-500 p-[1px]', className]} ref={this.tableDiv}>
        <div class="flex gap-[1px]">
          <CellHeader className="flex-[0_0_300px]">項目名</CellHeader>
          <CellHeader className="flex-[0_0_100px]">値</CellHeader>
          <CellHeader className="flex-auto">説明</CellHeader>
          <CellHeader className="flex-[0_0_50px]">操作</CellHeader>
        </div>
        {items?.map((item) => (
          <EnumerationRow item={item} tableDiv={this.tableDiv} />
        ))}
      </div>
    )
  }

  async addRow() {
    const row = new EnumerationRow({ tableDiv: this.tableDiv })
    this.tableDiv.value?.appendChild(await row.render())
  }
}
