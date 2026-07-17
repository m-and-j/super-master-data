import { SubEditorPanel } from '@/components/data-grid/SubEditorPanel'
import { DataClassification, DataKind, DataKindExtension } from '@/systems/defines'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { preferences } from '@/systems/preferences'
import { DataStructColumnRaw, TableRaw } from '@/systems/types'
import { MJ, MJComponent, Reference } from '@mj/jsx'

interface Props {
  column: DataStructColumnRaw
  value: any
  rowIndex: number
  className?: MJ.ClassProp
  schemaPanelRef?: Reference<SubEditorPanel>
}

/**
 * カラムセルのエディタ
 */
export class MasterDataCell extends MJComponent<Props> {
  private relationTable?: TableRaw

  async beforeRender({ column }: Props) {
    const { type } = column
    if (type.classification === DataClassification.RelationID) {
      this.relationTable = await masterDataAccessor.read(type.typeName)
    }
  }

  createNode({ column, value, rowIndex, className, schemaPanelRef }: Props) {
    const { type } = column
    const baseCss = ['data-grid-cell flex items-center px-2 py-1', rowIndex % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800']
    if (type.classification === DataClassification.Schema) {
      const summary = type.extension === DataKindExtension.Array ? `${(value as unknown[] | undefined)?.length ?? 0}件` : value ? '詳細' : '未設定'
      return (
        <div class={['cursor-pointer hover:bg-zinc-700', baseCss, className]} onclick={() => schemaPanelRef?.value?.open(column, value)}>
          <span class="truncate text-sm text-blue-400">{summary}</span>
        </div>
      )
    } else if (type.extension === DataKindExtension.Array) {
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
      let error = false
      if (this.relationTable) {
        const idColumnName = this.relationTable.columns.find((c) => c.type.classification === DataClassification.ID)?.name ?? ''
        const labelColumnName = this.relationTable.columns.find((c) => c.type.classification === DataClassification.Label)?.name ?? ''
        const item = this.relationTable.data.find((row) => `${row[idColumnName] ?? ''}` === value)
        if (item) {
          label = item[labelColumnName] ?? item[idColumnName]
        } else if (value) {
          label = value
          color = 'text-rose-500'
          error = true
        } else if (type.extension === DataKindExtension.Optional) {
          label = '(未指定)'
          color = 'text-zinc-400'
        } else {
          label = '(未設定)'
          color = 'text-rose-500'
          error = true
        }
      }
      return (
        <div class={['justify-between', baseCss, className]} onclick={() => {}}>
          {error && <span class="icon-[ic--baseline-error] text-lg text-rose-600"></span>}
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
        case DataKind.Date:
          return (
            <div class={[baseCss, className]}>
              <span class="truncate">{value}</span>
            </div>
          )
        case DataKind.Time:
          return (
            <div class={[baseCss, className]}>
              <span class="truncate">{value}</span>
            </div>
          )
        case DataKind.Datetime: {
          return (
            <div class={[baseCss, className]}>
              <span class="truncate">{value}</span>
            </div>
          )
        }
        default: {
          return (
            <div class={[baseCss, className]} onclick={() => {}}>
              <span class="truncate">{`${value}`}</span>
            </div>
          )
        }
      }
    }
  }
}
