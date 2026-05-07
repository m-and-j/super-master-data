import Button from '@/components/inputs/Button'
import CellHeader from '@/components/inputs/CellHeader'
import MasterDataCell, { ScalarArrayOpener, SchemaPanelOpener } from '@/components/inputs/MasterDataCell'
import { DataObjectColumn, MasterRecord } from '@/systems/types'
import { defaultValueFor, getColumnWidthCSS } from '@/utilities/data-grid'
import { formatCSS, MJ, MJCustomElement, Reference } from '@mj/jsx'

interface Props {
  columns: DataObjectColumn[]
  rows: MasterRecord[]
  parentSchemaName: string
  className?: MJ.ClassProp
  onOpenSchemaPanel: SchemaPanelOpener
  onOpenScalarArrayModal: ScalarArrayOpener
  ref?: Reference<MasterDataGrid>
}

/**
 * マスターデータ汎用グリッド
 */
export default class MasterDataGrid extends MJCustomElement<Props>()(HTMLDivElement) {
  private rows: MasterRecord[] = []

  async initialize({ rows }: Props) {
    this.rows = JSON.parse(JSON.stringify(rows))
  }

  connectedCallback() {
    const { className } = this.props
    this.className = formatCSS(['flex flex-col gap-[1px] bg-zinc-500 p-[1px]', className])
  }

  createNode({ columns, parentSchemaName, onOpenSchemaPanel, onOpenScalarArrayModal }: Props) {
    return (
      <>
        {/** ヘッダー */}
        <div class="flex gap-[1px]">
          <CellHeader className="flex-[0_0_60px] justify-center">#</CellHeader>
          {columns.map((column) => (
            <CellHeader className={getColumnWidthCSS(column)}>
              <span class="truncate" title={column.description || column.name}>
                {column.label || column.name}
              </span>
            </CellHeader>
          ))}
        </div>

        {/** 行 */}
        {this.rows.length > 0 ? (
          this.rows.map((row, index) => (
            <div class="flex gap-[1px]">
              <div class="flex flex-[0_0_60px] items-center justify-center bg-zinc-700">
                <Button variant="danger" size="none" onclick={() => this.deleteRow(index)} className="flex h-7 w-7 items-center justify-center">
                  <span class="icon-[ic--baseline-delete-forever] text-xl"></span>
                </Button>
              </div>
              {columns.map((column) => (
                <MasterDataCell
                  column={column}
                  value={row[column.name]}
                  parentSchemaName={parentSchemaName}
                  onOpenSchemaPanel={onOpenSchemaPanel}
                  onOpenScalarArrayModal={onOpenScalarArrayModal}
                />
              ))}
            </div>
          ))
        ) : (
          <div class="bg-zinc-800 px-2 py-3 text-sm text-zinc-500">行がありません。「+ 行追加」で追加してください。</div>
        )}
      </>
    )
  }

  async addRow() {
    const { columns } = this.props
    const values: MasterRecord = {}
    for (const column of columns) {
      values[column.name] = defaultValueFor(column)
    }
    this.rows.push(values)
    await this.render()
  }

  async deleteRow(index: number) {
    this.rows.splice(index, 1)
    await this.render()
  }
}
