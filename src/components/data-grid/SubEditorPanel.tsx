import { CellHeader } from '@/components/data-grid/CellHeader'
import { MasterDataGrid } from '@/components/data-grid/MasterDataGrid'
import { Button } from '@/components/inputs/Button'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { DataClassification } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { DataStructColumnRaw, MasterRecord, TableRaw } from '@/systems/types'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<SubEditorPanel> {
  openCallback?: () => void
  closeCallback?: () => void
}

/**
 * データ編集用分割パネル(右側に出る分割パネル)
 */
export class SubEditorPanel extends MJCustomElement<Props>()(HTMLDivElement) {
  private column?: DataStructColumnRaw
  private data: MasterRecord[] = []
  private grid: Reference<MasterDataGrid> = ref()
  private relationTable?: TableRaw

  connectedCallback() {
    this.addClassName('flex h-[calc(100vh-97px)] flex-col border-l border-zinc-500 bg-zinc-900')
  }

  createNode() {
    if (this.column) {
      return (
        <>
          {/** ヘッダー */}
          <div class="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
            <div class="flex-auto truncate font-semibold">
              <span title={this.column?.name}>{this.column?.label}</span>
            </div>
            <Button variant="success" size="sm" onclick={() => this.grid.value?.addRow()}>
              <span class="icon-[ic--baseline-add] text-lg"></span>
              行追加
            </Button>
            <Button variant="secondary" size="sm" onclick={() => this.close()}>
              <span class="icon-[ic--baseline-close] text-lg"></span>
              閉じる
            </Button>
          </div>

          {/** 本体 */}
          <div class="scrollbar flex-auto overflow-scroll">{this.renderContent()}</div>
        </>
      )
    }
  }

  renderContent() {
    if (this.column) {
      const { type } = this.column
      switch (type.classification) {
        case DataClassification.Schema: {
          const projectInfo = preferences.getProjectInfo()
          const schema = projectInfo.schemas.find((s) => s.name === type.typeName)
          if (schema) {
            return <MasterDataGrid ref={this.grid} columns={schema.columns} data={this.data} className="contents" />
          } else {
            return <div class="flex h-full items-center justify-center text-rose-300">スキーマ「{this.column?.type.typeName}」が見つかりません。</div>
          }
        }

        case DataClassification.RelationID: {
          const idColumnName = this.relationTable?.columns.find((c) => c.type.classification === DataClassification.ID)?.name ?? ''
          const labelColumnName = this.relationTable?.columns.find((c) => c.type.classification === DataClassification.Label)?.name ?? ''
          const labelMap = new Map<MasterRecord, string>()
          for (const row of this.relationTable?.data ?? []) {
            labelMap.set(row[idColumnName] ?? '', row[labelColumnName] ?? '')
          }
          return (
            <div class="grid grid-cols-[45px_auto_auto]">
              <CellHeader className="justify-center">#</CellHeader>
              <CellHeader>
                {type.typeName}.id【{this.relationTable?.description}】
              </CellHeader>
              <CellHeader>ラベル</CellHeader>
              {this.data.map((value, index) => (
                <>
                  <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
                  <div class="data-grid-cell px-2 py-1" data-row-index={index}>
                    {value}
                  </div>
                  <div class="data-grid-cell px-2 py-1" data-row-index={index}>
                    {labelMap.get(value) ?? ''}
                  </div>
                </>
              ))}
            </div>
          )
        }

        default: {
          return (
            <div class="grid grid-cols-[45px_auto]">
              <CellHeader className="justify-center">#</CellHeader>
              <CellHeader>{type.typeName}</CellHeader>
              {this.data.map((value, index) => (
                <>
                  <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
                  <div class="data-grid-cell px-2 py-1" data-row-index={index}>
                    {value}
                  </div>
                </>
              ))}
            </div>
          )
        }
      }
    }
    return null
  }

  async open(column: DataStructColumnRaw, data: any) {
    this.column = column
    this.data = data
    if (column.type.classification === DataClassification.RelationID) {
      this.relationTable = await masterDataAccessor.read(column.type.typeName)
    }
    this.classList.remove('hidden')
    this.props.openCallback?.()
    await this.render()
  }

  async close() {
    this.classList.add('hidden')
    this.props.closeCallback?.()
  }
}
