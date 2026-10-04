import { AccessorBase } from '@/systems/accessors/accessor-base'
import { ProjectFolder } from '@/systems/defines'
import { DataStructColumnRaw, DataStructRaw } from '@/systems/types'

class SchemaAccessor extends AccessorBase<DataStructRaw> {
  constructor() {
    super('Schemas', ProjectFolder.Schemas)
  }

  async write(schema: DataStructRaw, oldName?: string) {
    // JSONパラメータ整列のためのデータ再構築
    const { name, description } = schema
    const columns: DataStructColumnRaw[] = []
    for (const { name, label, type, description } of schema.columns) {
      columns.push({ name, label, type, description })
    }
    await super.write({ name, description, columns }, oldName)
  }
}

export const schemaAccessor = new SchemaAccessor()
