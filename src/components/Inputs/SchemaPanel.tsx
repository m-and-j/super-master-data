import Button from '@/components/inputs/Button'
import MasterDataCell, { ScalarArrayOpener, SchemaPanelOpener } from '@/components/inputs/MasterDataCell'
import MasterDataGrid from '@/components/inputs/MasterDataGrid'
import preferences from '@/systems/preferences'
import { DataObject, DataObjectColumn } from '@/systems/types'
import { defaultValueFor } from '@/utilities/data-grid'
import { MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  level: number
  parentValues: Record<string, any>
  columnName: string
  schemaName: string
  isArray: boolean
  onClose: () => void
  onOpenSchemaPanel: SchemaPanelOpener
  onOpenScalarArrayModal: ScalarArrayOpener
}

/**
 * スキーマ列クリック時に右側に出る分割パネル。
 *
 * - isArray=false: 単一スキーマ。フォーム形式で1件分のフィールドを縦に並べる
 * - isArray=true:  スキーマ配列。MasterDataGrid を再利用してミニグリッドで編集
 *
 * 値の編集は `parentValues[columnName]` を直接 mutate する。
 * パネル内のスキーマ列クリックは `onOpenSchemaPanel` で親エディタに伝え、
 * さらに右側にパネルが追加される(再帰的にネスト可能)。
 */
export default class SchemaPanel extends MJComponent<Props> {
  private grid: Reference<MasterDataGrid> = ref()

  createNode({ level, parentValues, columnName, schemaName, isArray, onClose, onOpenSchemaPanel, onOpenScalarArrayModal }: Props) {
    const projectInfo = preferences.getProjectInfo()
    const schema = projectInfo.schemas.find((s) => s.name === schemaName)

    return (
      <div class="flex h-full w-[640px] flex-shrink-0 flex-col border-l-3 border-zinc-500 bg-zinc-900">
        {/** ヘッダー */}
        <div class="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
          <div class="text-xs text-zinc-400">L{level + 1}</div>
          <div class="flex-auto truncate font-semibold">
            {isArray ? `${schemaName}[]` : schemaName}
            <span class="ml-2 text-sm text-zinc-400">({columnName})</span>
          </div>
          {isArray && schema && (
            <Button variant="success" size="sm" onclick={() => this.grid.value?.addRow()}>
              <span class="icon-[ic--baseline-add] text-lg"></span>
              行追加
            </Button>
          )}
          <Button variant="secondary" size="sm" onclick={() => onClose()}>
            <span class="icon-[ic--baseline-close] text-lg"></span>
            閉じる
          </Button>
        </div>

        {/** 本体 */}
        <div class="scrollbar flex-auto overflow-auto p-3">
          {!schema ? (
            <div class="text-rose-300">スキーマ「{schemaName}」が見つかりません。</div>
          ) : isArray ? (
            this.renderArray(schema, parentValues, columnName, onOpenSchemaPanel, onOpenScalarArrayModal)
          ) : (
            this.renderSingle(schema, parentValues, columnName, onOpenSchemaPanel, onOpenScalarArrayModal)
          )}
        </div>
      </div>
    )
  }

  private renderArray(schema: DataObject, parentValues: Record<string, any>, columnName: string, onOpenSchemaPanel: SchemaPanelOpener, onOpenScalarArrayModal: ScalarArrayOpener) {
    if (!Array.isArray(parentValues[columnName])) {
      parentValues[columnName] = []
    }
    const arr = parentValues[columnName] as Record<string, any>[]
    return (
      <MasterDataGrid
        ref={this.grid}
        columns={schema.columns}
        rows={arr}
        parentSchemaName={schema.name}
        onOpenSchemaPanel={onOpenSchemaPanel}
        onOpenScalarArrayModal={onOpenScalarArrayModal}
      />
    )
  }

  private renderSingle(schema: DataObject, parentValues: Record<string, any>, columnName: string, onOpenSchemaPanel: SchemaPanelOpener, onOpenScalarArrayModal: ScalarArrayOpener) {
    if (!parentValues[columnName] || typeof parentValues[columnName] !== 'object' || Array.isArray(parentValues[columnName])) {
      parentValues[columnName] = this.makeDefaultValues(schema.columns)
    }
    const values = parentValues[columnName] as Record<string, any>
    return (
      <div class="flex flex-col gap-2">
        {schema.columns.map((column) => (
          <div class="flex items-center gap-3">
            <div class="flex-[0_0_140px] text-right text-sm">
              <span title={column.description || column.name}>{column.label || column.name}</span>
            </div>
            <MasterDataCell column={column} value={values} parentSchemaName={schema.name} onOpenSchemaPanel={onOpenSchemaPanel} onOpenScalarArrayModal={onOpenScalarArrayModal} />
          </div>
        ))}
      </div>
    )
  }

  private makeDefaultValues(columns: DataObjectColumn[]): Record<string, any> {
    const values: Record<string, any> = {}
    for (const column of columns) {
      values[column.name] = defaultValueFor(column)
    }
    return values
  }
}
