import CellText from '@/components/data-grid/CellText'
import CellTypeSelect from '@/components/data-grid/CellTypeSelect'
import Button from '@/components/inputs/Button'
import {
  DataClassification,
  DataClassificationLabelValues,
  DataClassificationType,
  DataKindExtensionLabelValues,
  DataKindExtensionType,
  DataKindForIdValues,
  DataKindForLabelValues,
  DataKindValues,
} from '@/systems/define'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { DataObjectColumn } from '@/systems/types'
import { MJComponent, ref, Reference } from '@mj/jsx'

interface Props {
  schemaName?: string
  index: number
  column: DataObjectColumn
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  deleteRow: (index: number) => void
}

/**
 * データオブジェクトテーブル行
 */
export default class DataObjectRow extends MJComponent<Props> {
  private dataKindSelect: Reference<CellTypeSelect> = ref()
  private dataKindForIdSelect: Reference<CellTypeSelect> = ref()
  private dataKindForLabelSelect: Reference<CellTypeSelect> = ref()
  private tableSelect: Reference<CellTypeSelect> = ref()
  private schemaSelect: Reference<CellTypeSelect> = ref()
  private enumerationSelect: Reference<CellTypeSelect> = ref()

  createNode({ schemaName, index, column, moveUp, moveDown, deleteRow }: Props) {
    const { name, label, type, description } = column
    const { typeName, classification, extension } = type
    const dataClassificationItems = DataClassificationLabelValues.map(([value, label]) => ({ label, value, selected: classification === value }))
    const dataKindItems = DataKindValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const dataKindForIdItems = DataKindForIdValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const dataKindForLabelItems = DataKindForLabelValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
    const dataKindOptionItems = DataKindExtensionLabelValues.map(([value, label]) => ({ label, value, selected: extension === value }))
    const tables = masterData.getNames().map((name) => ({ label: name, value: name, selected: column.type.typeName === name }))
    const projectInfo = preferences.getProjectInfo()
    const schemas = projectInfo.schemas.filter(({ name }) => name !== schemaName).map(({ name }) => ({ label: name, value: name, selected: typeName === name }))
    const enumerations = projectInfo.enumerations.map(({ name, description }) => ({ label: `${name}【${description}】`, value: name, selected: typeName === name }))
    return (
      <>
        <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
        <CellText value={name} onchange={(e) => this.changeName(e)} />
        <CellText value={label} onchange={(e) => this.changeLabel(e)} />
        <CellTypeSelect items={dataClassificationItems} onchange={(e) => this.changeClassification(e)} />
        <CellTypeSelect items={dataKindItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindSelect} />
        <CellTypeSelect items={dataKindForIdItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindForIdSelect} />
        <CellTypeSelect items={dataKindForLabelItems} onchange={(e) => this.changeKind(e)} ref={this.dataKindForLabelSelect} />
        <CellTypeSelect items={tables} onchange={(e) => this.changeKind(e)} ref={this.tableSelect} />
        <CellTypeSelect items={schemas} onchange={(e) => this.changeKind(e)} ref={this.schemaSelect} />
        <CellTypeSelect items={enumerations} onchange={(e) => this.changeKind(e)} ref={this.enumerationSelect} />
        <CellTypeSelect items={dataKindOptionItems} onchange={(e) => this.changeKindExtension(e)} />
        <CellText value={description} onchange={(e) => this.changeDescription(e)} />
        <div class="data-grid-cell">
          <div class="m-1 flex justify-between">
            <Button variant="success" size="none" className="flex-[0_0_40px]" onclick={() => moveUp(index)}>
              <span class="icon-[ic--baseline-arrow-upward] text-2xl"></span>
            </Button>
            <Button variant="success" size="none" className="flex-[0_0_40px]" onclick={() => moveDown(index)}>
              <span class="icon-[ic--baseline-arrow-downward] text-2xl"></span>
            </Button>
            <Button variant="danger" size="none" className="flex-[0_0_40px]" onclick={() => deleteRow(index)}>
              <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
            </Button>
          </div>
        </div>
      </>
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

  private changeKindExtension(e: Event) {
    const { column } = this.props
    column.type.extension = (e.target as HTMLSelectElement).value as DataKindExtensionType
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
