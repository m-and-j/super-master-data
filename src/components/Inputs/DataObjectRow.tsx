import Button from '@/components/Inputs/Button'
import CellText from '@/components/Inputs/CellText'
import CellTypeCheckBox from '@/components/Inputs/CellTypeCheckBox'
import CellTypeSelect from '@/components/Inputs/CellTypeSelect'
import { DataClassificationType, DataClassificationValues, DataKindValues } from '@/systems/define'
import { DataObjectColumn } from '@/systems/types'
import { MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  index: number
  column: DataObjectColumn
  deleteRow: (index: number) => void
  onmousedown: (event: MouseEvent, row: HTMLDivElement) => void
}

/**
 * データオブジェクトテーブル行
 */
export default class DataObjectRow extends MJComponent<Props> {
  private row: Reference<HTMLDivElement> = ref()

  createNode({ index, column, deleteRow, onmousedown }: Props) {
    const { name, label, type, description } = column
    const { typeName, classification, array, nullable } = type
    const dataClassificationItems = DataClassificationValues.map(([label, value]) => ({ label, value, selected: classification === value }))
    const dataKindItems = DataKindValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    return (
      <div class="flex gap-[1px]" ref={this.row}>
        <div class="flex-[0_0_50px] flex justify-center items-center bg-zinc-600 cursor-grab" onmousedown={(e) => onmousedown(e, this.row.value!)}>
          {index + 1}
        </div>
        <CellText className="flex-[0_0_300px]" value={name} onchange={this.changeName} />
        <CellText className="flex-[0_0_200px]" value={label} onchange={(e) => this.changeLabel(e)} />
        <CellTypeSelect items={dataClassificationItems} onchange={(e) => this.changeClassification(e)} />
        <CellTypeSelect className="flex-[0_0_250px]" items={dataKindItems} onchange={(e) => this.changeKind(e)} />
        <CellTypeCheckBox label="Array" checked={array} onchange={(val) => this.changeArray(val)} />
        <CellTypeCheckBox label="Nullable" checked={nullable} onchange={(val) => this.changeNullable(val)} />
        <CellText className="flex-2" value={description} onchange={(e) => this.changeDescription(e)} />
        <Button className="flex-[0_0_50px]" variant="danger" size="min" onclick={() => deleteRow(index)}>
          <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
        </Button>
      </div>
    )
  }

  changeName(e: Event) {
    const { column } = this.props
    column.name = (e.target as HTMLInputElement).value
  }

  changeLabel(e: Event) {
    const { column } = this.props
    column.label = (e.target as HTMLInputElement).value
  }

  changeClassification(e: Event) {
    const { column } = this.props
    column.type.classification = (e.target as HTMLSelectElement).value as DataClassificationType
  }

  changeKind(e: Event) {
    const { column } = this.props
    column.type.typeName = (e.target as HTMLSelectElement).value
  }

  changeArray(val: boolean) {
    const { column } = this.props
    column.type.array = val
  }

  changeNullable(val: boolean) {
    const { column } = this.props
    column.type.nullable = val
  }

  changeDescription(e: Event) {
    const { column } = this.props
    column.description = (e.target as HTMLInputElement).value
  }
}
