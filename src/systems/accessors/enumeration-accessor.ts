import { AccessorBase } from '@/systems/accessors/accessor-base'
import { ProjectFolder } from '@/systems/defines'
import { EnumerationStructItemRaw, EnumerationStructRaw } from '@/systems/types'

class EnumerationAccessor extends AccessorBase<EnumerationStructRaw> {
  constructor() {
    super('Enumerations', ProjectFolder.Enumerations)
  }

  async write(enumeration: EnumerationStructRaw, oldName?: string) {
    // JSONパラメータ整列のためのデータ再構築
    const { name, description } = enumeration
    const items: EnumerationStructItemRaw[] = []
    for (const { label, value, description } of enumeration.items) {
      items.push({ label, value, description })
    }
    await super.write({ name, description, items }, oldName)
  }
}

export const enumerationAccessor = new EnumerationAccessor()
