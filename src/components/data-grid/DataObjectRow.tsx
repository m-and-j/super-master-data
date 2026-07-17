import { DataObjectCell } from '@/components/data-grid/DataObjectCell'
import { Button } from '@/components/inputs/Button'
import { DataClassification, DataClassificationLabelValues, DataKindExtensionLabelValues, DataKindForIdValues, DataKindForLabelValues, DataKindValues } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { DataStructColumnRaw } from '@/systems/types'
import { MJComponent } from '@mj/jsx'

interface Props {
  index: number
  column: DataStructColumnRaw
  deleteRow: (index: number) => void
}

/**
 * データオブジェクトテーブル行
 */
export class DataObjectRow extends MJComponent<Props> {
  createNode({ index, column, deleteRow }: Props) {
    const { name, label, type, description } = column
    const { typeName, classification, extension } = type
    const dataClassificationLabel = DataClassificationLabelValues.find(([value]) => classification === value)?.[1] ?? ''
    let typeNameLabel
    switch (classification) {
      case DataClassification.Scalar: {
        const [label] = DataKindValues.find(([, value]) => typeName === value) ?? []
        typeNameLabel = label ?? ''
        break
      }
      case DataClassification.ID: {
        const [label] = DataKindForIdValues.find(([, value]) => typeName === value) ?? []
        typeNameLabel = label ?? ''
        break
      }
      case DataClassification.EnumerationID: {
        const projectInfo = preferences.getProjectInfo()
        const { name, description } = projectInfo.enumerations.find(({ name }) => typeName === name) ?? {}
        typeNameLabel = `${name}【${description}】`
        break
      }
      case DataClassification.Label: {
        const [label] = DataKindForLabelValues.find(([, value]) => typeName === value) ?? []
        typeNameLabel = label ?? ''
        break
      }
      case DataClassification.RelationID:
      case DataClassification.Schema: {
        typeNameLabel = typeName
        break
      }
      case DataClassification.Enumeration: {
        const projectInfo = preferences.getProjectInfo()
        const { name, description } = projectInfo.enumerations.find(({ name }) => typeName === name) ?? {}
        typeNameLabel = `${name}【${description}】`
        break
      }
    }
    const [, dataKindOption] = DataKindExtensionLabelValues.find(([value]) => extension === value) ?? [, '']
    return (
      <>
        <div class="flex items-center justify-center bg-zinc-600">{index + 1}</div>
        <DataObjectCell rowIndex={index} column={column} kind="name" value={name} />
        <DataObjectCell rowIndex={index} column={column} kind="label" value={label} />
        <DataObjectCell rowIndex={index} column={column} kind="typeClassification" value={dataClassificationLabel} selectable />
        <DataObjectCell rowIndex={index} column={column} kind="typeName" value={typeNameLabel} selectable />
        <DataObjectCell rowIndex={index} column={column} kind="typeExtension" value={dataKindOption} selectable />
        <DataObjectCell rowIndex={index} column={column} kind="description" value={description} />
        <div class="data-grid-cell">
          <div class="m-1 flex justify-center">
            <Button variant="danger" size="none" className="flex-[0_0_40px]" onclick={() => deleteRow(index)}>
              <span class="icon-[ic--baseline-delete-forever] text-2xl"></span>
            </Button>
          </div>
        </div>
      </>
    )
  }
}
