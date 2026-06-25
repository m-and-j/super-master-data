import { DataObjectCursor } from '@/components/data-grid/DataObjectCursor'
import { DataStructColumnLabel, DataStructColumnRaw } from '@/systems/types'
import { MJComponent } from '@mj/jsx'

interface Props {
  column: DataStructColumnRaw
  kind: DataStructColumnLabel
  value: string
  selectable?: boolean
}

/**
 * データオブジェクトテーブルセル
 */
export class DataObjectCell extends MJComponent<Props> {
  createNode({ column, kind, value, selectable }: Props) {
    return (
      <div class="data-grid-cell flex cursor-default items-center justify-between px-2" onclick={(e) => DataObjectCursor.instance?.select(e, column, kind)}>
        <span class="truncate" title={value}>
          {value}
        </span>
        {selectable && <span class="icon-[ic--baseline-keyboard-arrow-down] text-lg"></span>}
      </div>
    )
  }
}
