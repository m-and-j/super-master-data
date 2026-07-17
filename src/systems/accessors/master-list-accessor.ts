import { AccessorBase } from '@/systems/accessors/accessor-base'
import { DataClassification, DataKind, DataKindExtension, ProjectFolder } from '@/systems/defines'
import { DataStructColumnRaw, MasterRecord, TableRaw } from '@/systems/types'

class MasterListAccessor extends AccessorBase<TableRaw> {
  constructor() {
    super('MasterList', ProjectFolder.Lists)
  }

  async write(table: TableRaw) {
    // JSONパラメータ整列のためのデータ再構築
    const columns: DataStructColumnRaw[] = []
    for (const { name, label, type, description } of table.columns) {
      const { classification, typeName, extension } = type
      columns.push({ name, label, type: { classification, typeName, extension }, description })
    }
    const data = []
    for (const row of table.data) {
      const value: MasterRecord = {}
      for (const newColumn of columns) {
        const oldColumn = table.columns.find((c) => c.name === newColumn.name)
        if (
          oldColumn &&
          newColumn.type.classification === oldColumn.type.classification &&
          newColumn.type.typeName === oldColumn.type.typeName &&
          newColumn.type.extension === oldColumn.type.extension
        ) {
          value[newColumn.name] = row[oldColumn.name]
        } else {
          switch (newColumn.type.extension) {
            case DataKindExtension.Array: {
              value[newColumn.name] = []
              break
            }
            case DataKindExtension.Optional: {
              value[newColumn.name] = null
              break
            }
            default: {
              if (newColumn.type.classification === DataClassification.Enumeration) {
                value[newColumn.name] = 0
              } else {
                switch (newColumn.type.typeName) {
                  case DataKind.Bool: {
                    value[newColumn.name] = false
                    break
                  }
                  case DataKind.Date:
                  case DataKind.Datetime:
                  case DataKind.Time:
                  case DataKind.String: {
                    value[newColumn.name] = ''
                    break
                  }
                  case DataKind.Int:
                  case DataKind.Float:
                  case DataKind.Double: {
                    value[newColumn.name] = 0
                    break
                  }
                  default: {
                    value[newColumn.name] = null
                    break
                  }
                }
              }
              break
            }
          }
        }
      }
      data.push(value)
    }
    await super.write({ name: table.name, description: table.description, columns, data })
  }
}

export const masterListAccessor = new MasterListAccessor()
