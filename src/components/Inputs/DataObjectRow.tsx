import Button from '@/components/inputs/Button'
import CellText from '@/components/inputs/CellText'
import CellTypeCheckBox from '@/components/inputs/CellTypeCheckBox'
import CellTypeSelect from '@/components/inputs/CellTypeSelect'
import { DataClassification, DataClassificationLabelValues, DataClassificationType, DataKindForIdValues, DataKindForLabelValues, DataKindValues } from '@/systems/define'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { DataObjectColumn } from '@/systems/types'
import { MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  schemaName?: string
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
  private dataKindSelect: Reference<CellTypeSelect> = ref()
  private dataKindForIdSelect: Reference<CellTypeSelect> = ref()
  private dataKindForLabelSelect: Reference<CellTypeSelect> = ref()
  private tableSelect: Reference<CellTypeSelect> = ref()
  private schemaSelect: Reference<CellTypeSelect> = ref()
  private enumerationSelect: Reference<CellTypeSelect> = ref()

  createNode({ schemaName, index, column, deleteRow, onmousedown }: Props) {
    const { name, label, type, description } = column
    const { typeName, classification, array, nullable } = type
    const dataClassificationItems = DataClassificationLabelValues.map(([value, label]) => ({ label, value, selected: classification === value }))
    const dataKindItems = DataKindValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const dataKindForIdItems = DataKindForIdValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const dataKindForLabelItems = DataKindForLabelValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const tables = masterData.getNames().map((name) => ({ label: name, value: name, selected: column.type.typeName === name }))
    const projectInfo = preferences.getProjectInfo()
    const schemas = projectInfo.schemas.filter(({ name }) => name !== schemaName).map(({ name }) => ({ label: name, value: name, selected: typeName === name }))
    const enumerations = projectInfo.enumerations.map(({ name, description }) => ({ label: `${name}【${description}】`, value: name, selected: typeName === name }))
    return (
      <div class="flex gap-[1px]" ref={this.row}>
        <div class="flex flex-[0_0_50px] cursor-grab items-center justify-center bg-zinc-600" onmousedown={(e) => onmousedown(e, this.row.value!)}>
          {index + 1}
        </div>
        <CellText className="flex-[0_0_300px]" value={name} onchange={this.changeName} />
        <CellText className="flex-[0_0_200px]" value={label} onchange={(e) => this.changeLabel(e)} />
        <CellTypeSelect items={dataClassificationItems} onchange={(e) => this.changeClassification(e)} />
        <CellTypeSelect className="flex-[0_0_250px]" items={dataKindItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindSelect} />
        <CellTypeSelect className="flex-[0_0_250px]" items={dataKindForIdItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindForIdSelect} />
        <CellTypeSelect className="flex-[0_0_250px]" items={dataKindForLabelItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindForLabelSelect} />
        <CellTypeSelect className="flex-[0_0_250px]" items={tables} onchange={(e) => this.changeKind(e)} ref={this.tableSelect} />
        <CellTypeSelect className="flex-[0_0_250px]" items={schemas} onchange={(e) => this.changeKind(e)} ref={this.schemaSelect} />
        <CellTypeSelect className="flex-[0_0_250px]" items={enumerations} onchange={(e) => this.changeKind(e)} ref={this.enumerationSelect} />
        <CellTypeCheckBox label="Array" checked={array} onchange={(val) => this.changeArray(val)} />
        <CellTypeCheckBox label="Nullable" checked={nullable} onchange={(val) => this.changeNullable(val)} />
        <CellText className="flex-2" value={description} onchange={(e) => this.changeDescription(e)} />
        <Button className="flex-[0_0_50px]" variant="danger" size="none" onclick={() => deleteRow(index)}>
          <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
        </Button>
      </div>
    )
  }

  async afterRender({ column }: Props) {
    this.refresh(column)
  }

  private changeName(e: Event) {
    const { column } = this.props
    column.name = (e.target as HTMLInputElement).value
  }

  private changeLabel(e: Event) {
    const { column } = this.props
    column.label = (e.target as HTMLInputElement).value
  }

  private changeClassification(e: Event) {
    const { column } = this.props
    column.type.classification = (e.target as HTMLSelectElement).value as DataClassificationType
    switch (column.type.classification) {
      case DataClassification.Scalar: {
        column.type.typeName = this.dataKindSelect.value?.getSelectedValue() ?? ''
        break
      }
      case DataClassification.Enumeration: {
        column.type.typeName = this.enumerationSelect.value?.getSelectedValue() ?? ''
        break
      }
      case DataClassification.Schema: {
        column.type.typeName = this.schemaSelect.value?.getSelectedValue() ?? ''
        break
      }
      case DataClassification.ID: {
        column.type.typeName = this.dataKindForIdSelect.value?.getSelectedValue() ?? ''
        break
      }
      case DataClassification.Label: {
        column.type.typeName = this.dataKindForLabelSelect.value?.getSelectedValue() ?? ''
        break
      }
      case DataClassification.RelationID: {
        column.type.typeName = this.tableSelect.value?.getSelectedValue() ?? ''
        break
      }
    }
    this.refresh(column)
  }

  private changeKind(e: Event) {
    const { column } = this.props
    column.type.typeName = (e.target as HTMLSelectElement).value
  }

  private changeArray(val: boolean) {
    const { column } = this.props
    column.type.array = val
  }

  private changeNullable(val: boolean) {
    const { column } = this.props
    column.type.nullable = val
  }

  private changeDescription(e: Event) {
    const { column } = this.props
    column.description = (e.target as HTMLInputElement).value
  }

  private refresh(column: DataObjectColumn) {
    this.dataKindSelect.value!.hide()
    this.dataKindForIdSelect.value!.hide()
    this.dataKindForLabelSelect.value!.hide()
    this.tableSelect.value!.hide()
    this.schemaSelect.value!.hide()
    this.enumerationSelect.value!.hide()
    switch (column.type.classification) {
      case DataClassification.Scalar: {
        this.dataKindSelect.value!.show()
        break
      }
      case DataClassification.Enumeration: {
        this.enumerationSelect.value!.show()
        break
      }
      case DataClassification.Schema: {
        this.schemaSelect.value!.show()
        break
      }
      case DataClassification.ID: {
        this.dataKindForIdSelect.value!.show()
        break
      }
      case DataClassification.Label: {
        this.dataKindForLabelSelect.value!.show()
        break
      }
      case DataClassification.RelationID: {
        this.tableSelect.value!.show()
        break
      }
    }
  }
}
