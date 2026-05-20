import { DataClassification, DataKind, DataKindExtension } from '@/systems/define'
import preferences from '@/systems/preferences'
import { DataObjectColumn } from '@/systems/types'

/**
 * カラムの初期値(新規行作成時)
 */
export function defaultValueFor(column: DataObjectColumn): any {
  if (column.type.extension === DataKindExtension.Array) {
    return []
  } else {
    switch (column.type.classification) {
      case DataClassification.Scalar: {
        switch (column.type.typeName) {
          case DataKind.Bool: {
            return false
          }
          case DataKind.Int:
          case DataKind.Float:
          case DataKind.Double: {
            return 0
          }
          default: {
            return ''
          }
        }
      }
      case DataClassification.Enumeration: {
        const enumeration = preferences.getProjectInfo().enumerations.find((e) => e.name === column.type.typeName)
        return enumeration?.items[0]?.value ?? 0
      }
      case DataClassification.Schema: {
        return null
      }
      case DataClassification.RelationID:
      case DataClassification.ID:
      default: {
        return ''
      }
    }
  }
}
