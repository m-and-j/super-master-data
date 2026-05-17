import CellHeader from '@/components/data-grid/CellHeader'
import DataObjectRow from '@/components/data-grid/DataObjectRow'
import { DataObjectColumn } from '@/systems/types'
import { formatCSS, MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<DataObjectTable> {
  schemaName?: string
  columns?: DataObjectColumn[]
}

/**
 * データオブジェクトテーブル
 */
export default class DataObjectTable extends MJCustomElement<Props>()(HTMLDivElement) {
  private columns: DataObjectColumn[] = []

  connectedCallback() {
    const { className } = this.props
    this.className = formatCSS(['scrollbar overflow-scroll', className])
  }

  async initialize({ columns }: Props) {
    this.columns = columns ?? []
  }

  createNode({ schemaName }: Props) {
    return (
      <div class="grid grid-cols-[50px_auto_auto_auto_auto_auto_auto_auto_140px]">
        <CellHeader className="flex items-center justify-center">#</CellHeader>
        <CellHeader>項目名</CellHeader>
        <CellHeader>ラベル</CellHeader>
        <CellHeader className="col-span-4">データ型</CellHeader>
        <CellHeader>説明</CellHeader>
        <CellHeader>操作</CellHeader>
        {this.columns.map((column, index) => (
          <DataObjectRow
            schemaName={schemaName}
            index={index}
            column={column}
            moveUp={(idx) => this.moveUp(idx)}
            moveDown={(idx) => this.moveDown(idx)}
            deleteRow={(idx) => this.deleteRow(idx)}
          />
        ))}
      </div>
    )
  }

  getColumns() {
    return this.columns
  }

  async addRow() {
    this.columns.push({ name: '', label: '', type: { classification: 'scalar', typeName: 'int', array: false, nullable: false }, description: '' })
    await this.render()
  }

  async deleteRow(index: number) {
    this.columns.splice(index, 1)
    await this.render()
  }

  async moveUp(index: number) {
    if (index > 0) {
      const tmp = this.columns[index]
      this.columns[index] = this.columns[index - 1]
      this.columns[index - 1] = tmp
    }
    await this.render()
  }

  async moveDown(index: number) {
    if (index < this.columns.length - 1) {
      const tmp = this.columns[index]
      this.columns[index] = this.columns[index + 1]
      this.columns[index + 1] = tmp
    }
    await this.render()
  }
}
