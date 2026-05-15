import SchemaPanel from '@/components/data-grid/SubEditorPanel'
import { DataClassification, DataKind } from '@/systems/define'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { DataObjectColumn, Table } from '@/systems/types'
import { MJ, MJComponent, Reference } from '@mj/jsx'

interface Props {
  column: DataObjectColumn
  value: any
  className?: MJ.ClassProp
  schemaPanelRef?: Reference<SchemaPanel>
}

/**
 * カラムセルのエディタ
 */
export default class MasterDataCell extends MJComponent<Props> {
  private relationTable?: Table

  async beforeRender({ column }: Props) {
    const { type } = column
    if (type.classification === DataClassification.RelationID) {
      this.relationTable = await masterData.read(type.typeName)
    }
  }

  createNode({ column, value, className, schemaPanelRef }: Props) {
    const { type } = column
    const baseCss = 'data-grid-cell flex items-center px-2 py-1'
    if (type.classification === DataClassification.Schema) {
      const summary = type.array ? `${(value as unknown[] | undefined)?.length ?? 0}件` : value ? '詳細' : '未設定'
      return (
        <div class={['cursor-pointer hover:bg-zinc-700', baseCss, className]} onclick={() => schemaPanelRef?.value?.open(column, value)}>
          <span class="truncate text-sm text-blue-400">{summary}</span>
        </div>
      )
    } else if (type.array) {
      const summary = `${(value as unknown[] | undefined)?.length ?? 0}件`
      return (
        <div class={['cursor-pointer hover:bg-zinc-700', baseCss, className]} onclick={() => schemaPanelRef?.value?.open(column, value)}>
          <span class="truncate text-sm text-blue-400">{summary}</span>
        </div>
      )
    } else if (type.classification === DataClassification.Enumeration) {
      const enumeration = preferences.getProjectInfo().enumerations.find((e) => e.name === column.type.typeName)
      const item = enumeration?.items.find((item) => value === item.value)
      return (
        <div class={['justify-between', baseCss, className]} onclick={() => {}}>
          <span class="truncate" title={item?.label}>
            {item?.description}
          </span>
          <span class="icon-[ic--baseline-keyboard-arrow-down] text-lg"></span>
        </div>
      )
    } else if (type.classification === DataClassification.RelationID) {
      let label
      let color
      if (this.relationTable) {
        const idColumn = this.relationTable.columns.find((c) => c.type.classification === DataClassification.ID)
        const labelColumn = this.relationTable.columns.find((c) => c.type.classification === DataClassification.Label)
        const item = this.relationTable.data.find((row) => `${row[idColumn?.name ?? ''] ?? ''}` === value)
        if (item) {
          label = item[labelColumn?.name ?? ''] ?? item[idColumn?.name ?? '']
        } else if (type.nullable) {
          label = '(未指定)'
          color = 'text-zinc-400'
        }
      }
      return (
        <div class={['justify-between', baseCss, className]} onclick={() => {}}>
          <span class={['truncate', color]}>{label}</span>
          <span class="icon-[ic--baseline-keyboard-arrow-down] text-lg"></span>
        </div>
      )
    } else {
      const { typeName } = column.type
      switch (typeName) {
        case DataKind.Bool:
          const checked = Boolean(value)
          return (
            <div class={['justify-center', baseCss, className]} onclick={() => {}}>
              <span class={[checked ? 'icon-[ic--baseline-check-box]' : 'icon-[ic--baseline-check-box-outline-blank]', 'text-xl']}></span>
            </div>
          )
        case DataKind.Int:
        case DataKind.Float:
        case DataKind.Double:
          return (
            <div class={[baseCss, className]} onclick={() => {}}>
              <span class="truncate">{value ?? 0}</span>
            </div>
          )
        case DataKind.Date:
          return (
            <div class={[baseCss, className]}>
              <span class="truncate">{value}</span>
            </div>
          )
        case DataKind.Time:
          return (
            <div class={[baseCss, className]}>
              <input type="time" value={value} class="h-full w-full bg-transparent outline-hidden" onchange={(e) => (value = (e.target as HTMLInputElement).value)} />
            </div>
          )
        case DataKind.Datetime: {
          return (
            <div class={['border border-transparent bg-zinc-800 px-2 py-1 has-[input:focus]:border-blue-500', className]}>
              <span class="truncate">{value}</span>
            </div>
          )
        }
        case DataKind.String:
        default: {
          return (
            <div class={[baseCss, className]} onclick={() => {}}>
              <span class="truncate">{value}</span>
            </div>
          )
        }
      }
    }
  }
}
