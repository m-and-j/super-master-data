import { CellHeader } from '@/components/data-grid/CellHeader'
import { DataObjectCursor } from '@/components/data-grid/DataObjectCursor'
import { DataObjectRow } from '@/components/data-grid/DataObjectRow'
import { DataKindExtension } from '@/systems/defines'
import { DataStructColumnLabel, DataStructColumnRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<DataObjectTable> {
  columns: DataStructColumnRaw[]
}

/**
 * データオブジェクトテーブル
 */
export class DataObjectTable extends MJCustomElement<Props>()(HTMLDivElement) {
  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  createNode({ columns }: Props) {
    return (
      <div class="grid grid-cols-[50px_auto_auto_auto_auto_auto_auto_50px]">
        <CellHeader className="flex items-center justify-center">#</CellHeader>
        <CellHeader>項目名</CellHeader>
        <CellHeader>ラベル</CellHeader>
        <CellHeader className="col-span-3">データ型</CellHeader>
        <CellHeader>説明</CellHeader>
        <CellHeader>操作</CellHeader>
        {columns.map((column, index) => (
          <DataObjectRow index={index} column={column} deleteRow={(idx) => this.deleteRow(idx)} />
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

  async moveUp() {
    const column = DataObjectCursor.instance?.getFocusColumn()
    if (column) {
      const { columns } = this.props
      const index = columns.indexOf(column)
      if (index > 0) {
        columns.splice(index, 1)
        columns.splice(index - 1, 0, column)
      }
      await this.render()
      DataObjectCursor.instance?.rerender()
    }
  }

  async moveDown() {
    const column = DataObjectCursor.instance?.getFocusColumn()
    if (column) {
      const { columns } = this.props
      const index = columns.indexOf(column)
      if (index >= 0) {
        columns.splice(index, 1)
        columns.splice(index + 1, 0, column)
      }
      await this.render()
      DataObjectCursor.instance?.rerender()
    }
  }

  getColumnElement(column?: DataStructColumnRaw, kind?: DataStructColumnLabel) {
    if (column && kind) {
      const { columns } = this.props
      const rowIndex = columns.indexOf(column)
      return this.querySelector(`[data-row-index="${rowIndex}"][data-kind="${kind}"]`)
    } else {
      return null
    }
  }
}
