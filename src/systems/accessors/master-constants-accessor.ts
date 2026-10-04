import { AccessorBase } from '@/systems/accessors/accessor-base'
import { outputAccessor } from '@/systems/accessors/output-accessor'
import { ProjectFolder } from '@/systems/defines'
import { ConstantGroupItemRaw, ConstantGroupRaw } from '@/systems/types'

class MasterConstantsAccessor extends AccessorBase<ConstantGroupRaw> {
  constructor() {
    super('MasterConstants', ProjectFolder.Constants)
  }

  async write(constantsGroup: ConstantGroupRaw, oldName?: string) {
    // JSONパラメータ整列のためのデータ再構築
    const items: ConstantGroupItemRaw[] = []
    for (const { name, label, type, value } of constantsGroup.items) {
      items.push({ name, label, type, value })
    }
    await super.write({ name: constantsGroup.name, description: constantsGroup.description, items }, oldName)
    if (oldName && oldName !== constantsGroup.name) {
      await outputAccessor.changeName({ constantGroup: { oldName, newName: constantsGroup.name } })
    }
  }

  async remove(constantsGroup: ConstantGroupRaw) {
    await super.remove(constantsGroup)
    await outputAccessor.deleteName({ constantGroupName: constantsGroup.name })
  }
}

export const masterConstantsAccessor = new MasterConstantsAccessor()
