import { CellHeader } from '@/components/data-grid/CellHeader'
import { EnumerationRow } from '@/components/data-grid/EnumerationRow'
import { EnumerationStructItemRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<EnumerationTable> {
  items: EnumerationStructItemRaw[]
}

/**
 * 列挙型テーブル
 */
export class EnumerationTable extends MJCustomElement<Props>()(HTMLDivElement) {
  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  createNode({ items }: Props) {
    return (
      <div class="grid grid-cols-[auto_auto_auto_140px]">
        <CellHeader>項目名</CellHeader>
        <CellHeader>値</CellHeader>
        <CellHeader>説明</CellHeader>
        <CellHeader>操作</CellHeader>
        {items.map((item, index) => (
          <EnumerationRow item={item} index={index} moveUp={(idx) => this.moveUp(idx)} moveDown={(idx) => this.moveDown(idx)} deleteRow={(idx) => this.deleteRow(idx)} />
        ))}
      </div>
    )
  }

  async addRow() {
    const { items } = this.props
    items.push({ label: '', value: 0, description: '' })
    await this.render()
  }

  async deleteRow(index: number) {
    const { items } = this.props
    items.splice(index, 1)
    await this.render()
  }

  async moveUp(index: number) {
    if (index > 0) {
      const { items } = this.props
      const tmp = items[index]
      items[index] = items[index - 1]
      items[index - 1] = tmp
    }
    await this.render()
  }

  async moveDown(index: number) {
    const { items } = this.props
    if (index < items.length - 1) {
      const tmp = items[index]
      items[index] = items[index + 1]
      items[index + 1] = tmp
    }
    await this.render()
  }
}
