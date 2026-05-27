import { CellHeader } from '@/components/data-grid/CellHeader'
import { DataObjectRow } from '@/components/data-grid/DataObjectRow'
import { DataKindExtension } from '@/systems/define'
import { DataObjectColumn } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<DataObjectTable> {
  schemaName: string
  columns: DataObjectColumn[]
}

/**
 * データオブジェクトテーブル
 */
export class DataObjectTable extends MJCustomElement<Props>()(HTMLDivElement) {
  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  createNode({ schemaName, columns }: Props) {
    return (
      <div class="grid grid-cols-[50px_auto_auto_auto_auto_auto_auto_140px]">
        <CellHeader className="flex items-center justify-center">#</CellHeader>
        <CellHeader>項目名</CellHeader>
        <CellHeader>ラベル</CellHeader>
        <CellHeader className="col-span-3">データ型</CellHeader>
        <CellHeader>説明</CellHeader>
        <CellHeader>操作</CellHeader>
        {columns.map((column, index) => (
          <DataObjectRow schemaName={schemaName} index={index} column={column} deleteRow={(idx) => this.deleteRow(idx)} />
        ))}
      </div>
    )
  }

  async addRow() {
    const { columns } = this.props
    columns.push({ name: '', label: '', type: { classification: 'scalar', typeName: 'int', extension: DataKindExtension.Empty }, description: '' })
    await this.render()
  }

  async deleteRow(index: number) {
    const { columns } = this.props
    columns.splice(index, 1)
    await this.render()
  }

  async moveUp(index: number) {
    if (index > 0) {
      const { columns } = this.props
      const tmp = columns[index]
      columns[index] = columns[index - 1]
      columns[index - 1] = tmp
    }
    await this.render()
  }

  async moveDown(index: number) {
    const { columns } = this.props
    if (index < columns.length - 1) {
      const tmp = columns[index]
      columns[index] = columns[index + 1]
      columns[index + 1] = tmp
    }
    await this.render()
  }
}
