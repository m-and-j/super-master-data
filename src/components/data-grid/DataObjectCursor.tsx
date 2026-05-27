import { DataObjectTable } from '@/components/data-grid/DataObjectTable'
import { DataObjectColumn, DataObjectColumnLabel } from '@/systems/types'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<HTMLDivElement> {
  dataObjectTable: Reference<DataObjectTable>
}

/**
 * データオブジェクトテーブルカーソル
 */
export class DataObjectCursor extends MJCustomElement<Props>()(HTMLDivElement) {
  static get instance() {
    return document.querySelector<DataObjectCursor>(DataObjectCursor.domName)
  }

  private input: Reference<HTMLInputElement> = ref()

  connectedCallback() {
    this.addClassName('absolute hidden bg-zinc-800/15')
  }

  createNode({ dataObjectTable }: Props) {
    return <div class="absolute hidden bg-zinc-800/15"></div>
  }

  select(column: DataObjectColumn, kind: DataObjectColumnLabel) {}
}
