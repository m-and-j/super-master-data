import CellText from '@/components/inputs/CellText'
import CellTypeSelect, { SelectItem } from '@/components/inputs/CellTypeSelect'
import { DataClassification, DataKind } from '@/systems/define'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { DataObjectColumn, Table } from '@/systems/types'
import { getColumnWidthCSS } from '@/utilities/data-grid'
import { MJ, MJComponent } from '@mj/jsx'

export type SchemaPanelOpener = (parentValues: Record<string, any>, columnName: string, schemaName: string, isArray: boolean) => void
export type ScalarArrayOpener = (parentValues: Record<string, any>, column: DataObjectColumn) => void

interface Props {
  column: DataObjectColumn
  value: any
  parentSchemaName?: string
  className?: MJ.ClassProp
  onOpenSchemaPanel: SchemaPanelOpener
  onOpenScalarArrayModal: ScalarArrayOpener
}

/**
 * カラム1セル分のエディタ。分類とarrayフラグからUIを切り替える。
 *
 * - schema: 「詳細」/「N件」ボタン → onOpenSchemaPanel
 * - schema以外でarray: 「N件」ボタン → onOpenScalarArrayModal
 * - id / scalar: 直接 input
 * - relationId / enumeration: select
 */
export default class MasterDataCell extends MJComponent<Props> {
  private relationTable?: Table

  async beforeRender({ column }: Props) {
    const { type } = column
    if (type.classification === DataClassification.RelationID) {
      this.relationTable = await masterData.read(type.typeName)
    }
  }

  createNode({ column, value, className, onOpenSchemaPanel, onOpenScalarArrayModal }: Props) {
    const { type } = column
    const widthClass = getColumnWidthCSS(column)
    if (type.classification === DataClassification.Schema) {
      const summary = type.array ? `${(value as unknown[] | undefined)?.length ?? 0}件` : value ? '詳細' : '未設定'
      return (
        <div
          class={['flex cursor-pointer items-center border border-transparent bg-zinc-800 px-2 py-1 hover:bg-zinc-700', widthClass, className]}
          onclick={() => onOpenSchemaPanel(value, column.name, type.typeName, type.array)}
        >
          <span class="truncate text-sm text-blue-400">{summary}</span>
        </div>
      )
    } else if (type.array) {
      const summary = `${(value as unknown[] | undefined)?.length ?? 0}件`
      return (
        <div
          class={['flex cursor-pointer items-center border border-transparent bg-zinc-800 px-2 py-1 hover:bg-zinc-700', widthClass, className]}
          onclick={() => onOpenScalarArrayModal(value, column)}
        >
          <span class="truncate text-sm text-blue-400">{summary}</span>
        </div>
      )
    } else if (type.classification === DataClassification.Enumeration) {
      const enumeration = preferences.getProjectInfo().enumerations.find((e) => e.name === column.type.typeName)
      const items = enumeration?.items.map((item) => ({ value: `${item.value}`, label: item.label, selected: value === item.value })) ?? []
      return <CellTypeSelect className={[widthClass, className]} items={items} onchange={(e) => (value = Number((e.target as HTMLSelectElement).value))} />
    } else if (type.classification === DataClassification.RelationID) {
      const items: SelectItem[] = []
      if (this.relationTable) {
        const idColumn = this.relationTable.columns.find((c) => c.type.classification === DataClassification.ID)
        const labelColumn = this.relationTable.columns.find((c) => c.type.classification === DataClassification.Label)
        if (type.nullable) {
          items.push({ value: '', label: '(未選択)' })
        }
        for (const row of this.relationTable.data) {
          const v = `${row[idColumn?.name ?? ''] ?? ''}`
          const l = `${row[labelColumn?.name ?? ''] ?? ''}`
          items.push({ value: v, label: l, selected: value === v })
        }
      }
      return <CellTypeSelect className={[widthClass, className]} items={items} onchange={(e) => (value = (e.target as HTMLSelectElement).value)} />
    } else {
      const { typeName } = column.type
      switch (typeName) {
        case DataKind.bool:
          return (
            <div class={['flex items-center justify-center border border-transparent bg-zinc-800 px-2 py-1', widthClass, className]}>
              <input type="checkbox" checked={Boolean(value)} onchange={(e) => (value = (e.target as HTMLInputElement).checked)} />
            </div>
          )
        case DataKind.int:
        case DataKind.float:
        case DataKind.double:
          return (
            <CellText
              type="number"
              className={[widthClass, className]}
              value={value ?? 0}
              onchange={(e) => {
                const v = (e.target as HTMLInputElement).value
                value = v === '' ? 0 : Number(v)
              }}
            />
          )
        case DataKind.date:
          return (
            <div class={['border border-transparent bg-zinc-800 px-2 py-1 has-[input:focus]:border-blue-500', widthClass, className]}>
              <input type="date" value={value} class="h-full w-full bg-transparent outline-hidden" onchange={(e) => (value = (e.target as HTMLInputElement).value)} />
            </div>
          )
        case DataKind.time:
          return (
            <div class={['border border-transparent bg-zinc-800 px-2 py-1 has-[input:focus]:border-blue-500', widthClass, className]}>
              <input type="time" value={value} class="h-full w-full bg-transparent outline-hidden" onchange={(e) => (value = (e.target as HTMLInputElement).value)} />
            </div>
          )
        case DataKind.datetime: {
          return (
            <div class={['border border-transparent bg-zinc-800 px-2 py-1 has-[input:focus]:border-blue-500', className]}>
              <input type="datetime-local" value={value} class="h-full w-full bg-transparent outline-hidden" onchange={(e) => (value = (e.target as HTMLInputElement).value)} />
            </div>
          )
        }
        case DataKind.string:
        default:
          return <CellText className={[widthClass, className]} value={value} onchange={(e) => (value = (e.target as HTMLInputElement).value)} />
      }
    }
  }
}
