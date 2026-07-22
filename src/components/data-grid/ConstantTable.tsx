import { CellHeader } from '@/components/data-grid/CellHeader'
import { ConstantRow } from '@/components/data-grid/ConstantRow'
import { ConstantKind } from '@/systems/defines'
import { ConstantGroupItemRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<ConstantTable> {
  items: ConstantGroupItemRaw[]
}

/**
 * 定数テーブル
 */
export class ConstantTable extends MJCustomElement<Props>()(HTMLDivElement) {
  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  createNode({ items }: Props) {
    return (
      <div class="grid grid-cols-[45px_auto_auto_120px_auto_60px]">
        <CellHeader className="justify-center">#</CellHeader>
        <CellHeader>定数名</CellHeader>
        <CellHeader>ラベル</CellHeader>
        <CellHeader>型</CellHeader>
        <CellHeader>値</CellHeader>
        <CellHeader>操作</CellHeader>
        {items.map((item, index) => (
          <ConstantRow item={item} index={index} deleteRow={(idx) => this.deleteRow(idx)} />
        ))}
      </div>
    )
  }

  async addRow() {
    const { items } = this.props
    items.push({ name: '', label: '', type: ConstantKind.Int, value: 0 })
    await this.render()
  }

  async deleteRow(index: number) {
    const { items } = this.props
    items.splice(index, 1)
    await this.render()
  }
}
