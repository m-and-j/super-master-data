import CellHeader from '@/components/data-grid/CellHeader'
import EnumerationRow from '@/components/data-grid/EnumerationRow'
import { EnumerationItem } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<EnumerationTable> {
  items?: EnumerationItem[]
}

/**
 * 列挙型テーブル
 */
export default class EnumerationTable extends MJCustomElement<Props>()(HTMLDivElement) {
  private items: EnumerationItem[] = []

  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  async initialize({ items }: Props) {
    this.items = items ?? []
  }

  createNode() {
    return (
      <div class="grid grid-cols-[auto_auto_auto_140px]">
        <CellHeader>項目名</CellHeader>
        <CellHeader>値</CellHeader>
        <CellHeader>説明</CellHeader>
        <CellHeader>操作</CellHeader>
        {this.items?.map((item, index) => (
          <EnumerationRow item={item} index={index} moveUp={(idx) => this.moveUp(idx)} moveDown={(idx) => this.moveDown(idx)} deleteRow={(idx) => this.deleteRow(idx)} />
        ))}
      </div>
    )
  }

  async addRow() {
    this.items.push({ label: '', value: 0, description: '' })
    await this.render()
  }

  async deleteRow(index: number) {
    this.items.splice(index, 1)
    await this.render()
  }

  async moveUp(index: number) {
    if (index > 0) {
      const tmp = this.items[index]
      this.items[index] = this.items[index - 1]
      this.items[index - 1] = tmp
    }
    await this.render()
  }

  async moveDown(index: number) {
    if (index < this.items.length - 1) {
      const tmp = this.items[index]
      this.items[index] = this.items[index + 1]
      this.items[index + 1] = tmp
    }
    await this.render()
  }
}
