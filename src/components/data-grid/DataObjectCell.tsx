import { DataObjectCursor } from '@/components/data-grid/DataObjectCursor'
import { DataStructColumnLabel, DataStructColumnRaw } from '@/systems/types'
import { MJComponent } from '@mj/jsx'

interface Props {
  rowIndex: number
  column: DataStructColumnRaw
  kind: DataStructColumnLabel
  value: string
  selectable?: boolean
}

/**
 * データオブジェクトテーブルセル
 */
export class DataObjectCell extends MJComponent<Props> {
  createNode({ rowIndex, column, kind, value, selectable }: Props) {
    const bgColor = rowIndex % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800'
    return (
      <div class={['data-grid-cell flex cursor-default items-center justify-between px-2', bgColor]} onclick={(e) => DataObjectCursor.instance?.select(e, column, kind)}>
        <span class="truncate" title={value}>
          {value}
        </span>
        {selectable && <span class="icon-[ic--baseline-keyboard-arrow-down] text-lg"></span>}
      </div>
    )
  }
}
