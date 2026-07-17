import { AccessorBase } from '@/systems/accessors/accessor-base'
import { ProjectFolder } from '@/systems/defines'
import { ConstantGroupItemRaw, ConstantGroupRaw } from '@/systems/types'

class MasterConstantsAccessor extends AccessorBase<ConstantGroupRaw> {
  constructor() {
    super('MasterConstants', ProjectFolder.Constants)
  }

  async write(constantsGroup: ConstantGroupRaw) {
    // JSONパラメータ整列のためのデータ再構築
    const items: ConstantGroupItemRaw[] = []
    for (const { name, label, type, value } of constantsGroup.items) {
      items.push({ name, label, type, value })
    }
    await super.write({ name: constantsGroup.name, description: constantsGroup.description, items })
  }
}

export const masterConstantsAccessor = new MasterConstantsAccessor()
