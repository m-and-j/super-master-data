import { DataObjectCellSelect } from '@/components/data-grid/DataObjectCellSelect'
import { DataObjectCellText } from '@/components/data-grid/DataObjectCellText'
import { DataObjectTable } from '@/components/data-grid/DataObjectTable'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import {
  DataClassification,
  DataClassificationLabelValues,
  DataClassificationLabelValuesForNoId,
  DataClassificationType,
  DataKind,
  DataKindExtensionLabelValues,
  DataKindExtensionType,
  DataKindForId,
  DataKindForIdValues,
  DataKindForLabel,
  DataKindForLabelValues,
  DataKindValues,
} from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { DataStructColumnLabel, DataStructColumnRaw } from '@/systems/types'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<HTMLDivElement> {
  schemaName: string
  dataObjectTable: Reference<DataObjectTable>
  enabledIdColumn?: boolean
}

/**
 * データオブジェクトテーブルカーソル
 */
export class DataObjectCursor extends MJCustomElement<Props>()(HTMLDivElement) {
  static get instance() {
    return document.querySelector<DataObjectCursor>(DataObjectCursor.domName)
  }

  private inputField: Reference<DataObjectCellText> = ref()
  private typeClassificationSelect: Reference<DataObjectCellSelect> = ref()
  private dataKindSelect: Reference<DataObjectCellSelect> = ref()
  private dataKindForIdSelect: Reference<DataObjectCellSelect> = ref()
  private dataKindForLabelSelect: Reference<DataObjectCellSelect> = ref()
  private dataKindExtensionSelect: Reference<DataObjectCellSelect> = ref()
  private tableSelect: Reference<DataObjectCellSelect> = ref()
  private schemaSelect: Reference<DataObjectCellSelect> = ref()
  private enumerationSelect: Reference<DataObjectCellSelect> = ref()
  private column?: DataStructColumnRaw
  private kind?: DataStructColumnLabel

  connectedCallback() {
    this.addClassName('absolute hidden transparent z-10 border-2 border-blue-500')
    this.addEventListener('dblclick', () => this.openEditor())
  }

  createNode({ schemaName, enabledIdColumn }: Props) {
    if (this.column && this.kind) {
      const { type } = this.column
      const { typeName, classification, extension } = type
      const dataClassificationItems = (enabledIdColumn ? DataClassificationLabelValues : DataClassificationLabelValuesForNoId).map(([value, label]) => ({
        label,
        value,
        selected: classification === value,
      }))
      const dataKindItems = DataKindValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
      const dataKindForIdItems = DataKindForIdValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
      const dataKindForLabelItems = DataKindForLabelValues.map(([label, value]) => ({ label, value, selected: typeName === value }))
      const dataKindExtensionItems = DataKindExtensionLabelValues.map(([value, label]) => ({ label, value, selected: extension === value }))
      const tables = masterDataAccessor.getNames().map((name) => ({ label: name, value: name, selected: typeName === name }))
      const projectInfo = preferences.getProjectInfo()
      const schemas = projectInfo.schemas.filter(({ name }) => name !== schemaName).map(({ name }) => ({ label: name, value: name, selected: typeName === name }))
      const enumerations = projectInfo.enumerations.map(({ name, description }) => ({ label: `${name}【${description}】`, value: name, selected: typeName === name }))
      return (
        <>
          <DataObjectCellText ref={this.inputField} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={dataClassificationItems} ref={this.typeClassificationSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={dataKindItems} ref={this.dataKindSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={dataKindForIdItems} ref={this.dataKindForIdSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={dataKindForLabelItems} ref={this.dataKindForLabelSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={dataKindExtensionItems} ref={this.dataKindExtensionSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={tables} ref={this.tableSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={schemas} ref={this.schemaSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
          <DataObjectCellSelect items={enumerations} ref={this.enumerationSelect} onblur={() => this.closeEditor()} onchange={(e) => this.changeValue(e)} />
        </>
      )
    } else {
      return <></>
    }
  }

  async select(event: MouseEvent, column: DataStructColumnRaw, kind: DataStructColumnLabel) {
    this.column = column
    this.kind = kind
    const { dataObjectTable } = this.props
    if (dataObjectTable.value) {
      this.classList.remove('hidden')
      const { top, height, left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect()
      this.style.top = `${top}px`
      this.style.left = `${left}px`
      this.style.width = `${width}px`
      this.style.height = `${height}px`
      await this.render()
    }
  }

  private openEditor() {
    if (this.column && this.kind) {
      this.closeEditor()
      switch (this.kind) {
        case 'name': {
          this.inputField.value?.show()
          this.inputField.value?.setValue(this.column.name)
          break
        }
        case 'label': {
          this.inputField.value?.show()
          this.inputField.value?.setValue(this.column.label)
          break
        }
        case 'typeClassification': {
          this.typeClassificationSelect.value?.show()
          break
        }
        case 'typeName': {
          switch (this.column.type.classification) {
            case DataClassification.Scalar: {
              this.dataKindSelect.value?.show()
              break
            }
            case DataClassification.ID: {
              this.dataKindForIdSelect.value?.show()
              break
            }
            case DataClassification.EnumerationID: {
              this.enumerationSelect.value?.show()
              break
            }
            case DataClassification.Label: {
              this.dataKindForLabelSelect.value?.show()
              break
            }
            case DataClassification.RelationID: {
              this.tableSelect.value?.show()
              break
            }
            case DataClassification.Schema: {
              this.schemaSelect.value?.show()
              break
            }
            case DataClassification.Enumeration: {
              this.enumerationSelect.value?.show()
              break
            }
          }
          break
        }
        case 'typeExtension': {
          this.dataKindExtensionSelect.value?.show()
          break
        }
        case 'description': {
          this.inputField.value?.show()
          this.inputField.value?.setValue(this.column.description)
          break
        }
      }
    }
  }

  private closeEditor() {
    this.inputField.value?.hide()
    this.typeClassificationSelect.value?.hide()
    this.dataKindForIdSelect.value?.hide()
    this.dataKindForLabelSelect.value?.hide()
    this.tableSelect.value?.hide()
    this.schemaSelect.value?.hide()
    this.enumerationSelect.value?.hide()
  }

  private async changeValue(e: Event) {
    if (this.column && this.kind) {
      switch (this.kind) {
        case 'name': {
          this.column.name = (e.target as HTMLInputElement).value
          break
        }
        case 'label': {
          this.column.label = (e.target as HTMLInputElement).value
          break
        }
        case 'typeClassification': {
          this.column.type.classification = (e.target as HTMLSelectElement).value as DataClassificationType
          switch (this.column.type.classification) {
            case DataClassification.Scalar: {
              this.column.type.typeName = DataKind.String
              break
            }
            case DataClassification.ID: {
              this.column.type.typeName = DataKindForId.String
              break
            }
            case DataClassification.Label: {
              this.column.type.typeName = DataKindForLabel.String
              break
            }
            case DataClassification.RelationID: {
              this.column.type.typeName = masterDataAccessor.getNames()[0] ?? ''
              break
            }
            case DataClassification.Schema: {
              this.column.type.typeName = preferences.getProjectInfo().schemas[0]?.name ?? ''
              break
            }
            case DataClassification.Enumeration: {
              this.column.type.typeName = preferences.getProjectInfo().enumerations[0]?.name ?? ''
              break
            }
          }
          break
        }
        case 'typeName': {
          this.column.type.typeName = (e.target as HTMLSelectElement).value
          break
        }
        case 'typeExtension': {
          this.column.type.extension = (e.target as HTMLSelectElement).value as DataKindExtensionType
          break
        }
        case 'description': {
          this.column.description = (e.target as HTMLInputElement).value
          break
        }
      }
      await this.props.dataObjectTable.value?.render()
    }
  }
}
