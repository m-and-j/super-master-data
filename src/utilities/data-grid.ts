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
    if (typeName === DataKind.bool) {
      return 'flex-[0_0_80px]'
    } else if (typeName === DataKind.int || typeName === DataKind.float || typeName === DataKind.double) {
      return 'flex-[0_0_140px]'
    } else if (typeName === DataKind.date) {
      return 'flex-[0_0_160px]'
    } else if (typeName === DataKind.time) {
      return 'flex-[0_0_140px]'
    } else if (typeName === DataKind.datetime) {
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
          case DataKind.bool: {
            return false
          }
          case DataKind.int:
          case DataKind.float:
          case DataKind.double: {
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
