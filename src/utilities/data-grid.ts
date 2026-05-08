import { DataClassification, DataKind } from '@/systems/define'
import preferences from '@/systems/preferences'
import { DataObjectColumn } from '@/systems/types'

/**
 * カラム種別ごとの幅CSS
 */
export function getColumnWidthCSS(column: DataObjectColumn): string {
  const { classification, typeName, array } = column.type
  if (classification === DataClassification.Schema) {
    return 'flex-[0_0_140px]'
  } else if (array) {
    return 'flex-[0_0_120px]'
  } else if (classification === DataClassification.Enumeration) {
    return 'flex-[0_0_220px]'
  } else if (classification === DataClassification.RelationID) {
    return 'flex-[0_0_220px]'
  } else if (classification === DataClassification.Scalar) {
    if (typeName === DataKind.Bool) {
      return 'flex-[0_0_80px]'
    } else if (typeName === DataKind.Int || typeName === DataKind.Float || typeName === DataKind.Double) {
      return 'flex-[0_0_140px]'
    } else if (typeName === DataKind.Date) {
      return 'flex-[0_0_160px]'
    } else if (typeName === DataKind.Time) {
      return 'flex-[0_0_140px]'
    } else if (typeName === DataKind.Datetime) {
      return 'flex-[0_0_220px]'
    } else {
      return 'flex-[0_0_220px]'
    }
  } else {
    return 'flex-[0_0_220px]'
  }
}

/**
 * カラムの初期値(新規行作成時)
 */
export function defaultValueFor(column: DataObjectColumn): any {
  if (column.type.array) {
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
