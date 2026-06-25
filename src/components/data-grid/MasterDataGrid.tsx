import { CellHeader } from '@/components/data-grid/CellHeader'
import { MasterDataCell } from '@/components/data-grid/MasterDataCell'
import { SubEditorPanel } from '@/components/data-grid/SubEditorPanel'
import { Button } from '@/components/inputs/Button'
import { DataStructColumnRaw, MasterRecord } from '@/systems/types'
import { defaultValueFor } from '@/utilities/data-grid'
import { MJ, MJCustomElement, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<MasterDataGrid> {
  columns: DataStructColumnRaw[]
  data: MasterRecord[]
  schemaPanelRef?: Reference<SubEditorPanel>
}

/**
 * マスターデータ汎用グリッド
 */
export class MasterDataGrid extends MJCustomElement<Props>()(HTMLDivElement) {
  private rows: MasterRecord[] = []

  async initialize({ data }: Props) {
    this.rows = JSON.parse(JSON.stringify(data))
  }

  connectedCallback() {
    this.addClassName('scrollbar overflow-scroll')
  }

  createNode({ columns, schemaPanelRef }: Props) {
    const gridTemplateColumns = ['45px', ...new Array(columns.length).fill('auto')].join(' ')
    return (
      <div class="grid" style={{ gridTemplateColumns }}>
        {/** ヘッダー */}
        <CellHeader className="justify-center">#</CellHeader>
        {columns.map((column) => (
          <CellHeader>
            <span class="truncate" title={column.label || column.name}>
              {column.label || column.name}
            </span>
            {column.description && <span class="icon-[ic--baseline-comment] text-lg text-emerald-400" title={column.description}></span>}
          </CellHeader>
        ))}

        {/** 行 */}
        {this.rows.length > 0 ? (
          this.rows.map((row, index) => (
            <>
              <div class="data-grid-header flex flex-[0_0_60px] items-center justify-center bg-zinc-700">
                <Button variant="danger" size="none" onclick={() => this.deleteRow(index)} className="flex h-7 w-7 items-center justify-center">
                  <span class="icon-[ic--baseline-delete-forever] text-xl"></span>
                </Button>
              </div>
              {columns.map((column) => (
                <MasterDataCell column={column} value={row[column.name]} schemaPanelRef={schemaPanelRef} />
              ))}
            </>
          ))
        ) : (
          <div class="bg-zinc-800 px-2 py-3 text-sm text-zinc-500" style={{ gridColumn: '1 / -1' }}>
            行がありません。「+ 行追加」で追加してください。
          </div>
        )}
      </div>
    )
  }

  async addRow() {
    const values: MasterRecord = []
    const { columns } = this.props
    for (let i = 0; i < columns.length; i++) {
      values[i] = defaultValueFor(columns[i])
    }
    this.rows.push(values)
    await this.render()
  }

  async deleteRow(index: number) {
    this.rows.splice(index, 1)
    await this.render()
  }
}
