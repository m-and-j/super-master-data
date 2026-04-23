import Button from '@/components/inputs/Button'
import EnumerationTable from '@/components/inputs/EnumerationTable'
import InputText from '@/components/inputs/InputText'
import { ColumnParams } from '@/systems/define'
import preferences from '@/systems/preferences'
import { EnumerationItem, EnumerationObject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJLink, MJPage, MJRouter } from '@mj/router'

export default class Enumerations extends MJPage {
  private targetEnumeration?: EnumerationObject
  private dataObjectTable: Reference<EnumerationTable> = ref()

  async beforeRender() {}

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetEnumeration = projectInfo.enumerations.find((e) => e.name === name)
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        <div class="flex-[0_0_200px] border-r-3 border-zinc-500 flex flex-col p-2">
          <MJLink to="/enumerations" className={['px-1 text-blue-500', name ? '' : 'bg-zinc-700']}>
            新規列挙型
          </MJLink>
          <hr class="my-3 border-zinc-500" />
          {projectInfo.enumerations.map((e) => (
            <MJLink to={`/enumerations/${e.name}`} className={['text-blue-500 px-1', e.name === name ? 'bg-zinc-700' : '']}>
              {e.name}
            </MJLink>
          ))}
        </div>
        <div class="flex-auto">
          <form onsubmit={(e) => this.register(e)}>
            <div class="flex items-center gap-2">
              <div class="flex-[0_0_100px] text-right">列挙型名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="列挙型名" value={this.targetEnumeration?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetEnumeration?.description} />
              </div>
            </div>
            <div class="mt-6 mx-2 flex justify-between">
              <Button variant="success" size="sm" onclick={() => this.dataObjectTable.value?.addRow()}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-add] text-lg"></span>
                  項目追加
                </div>
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
            </div>
            <EnumerationTable items={this.targetEnumeration?.items} className="mt-2" ref={this.dataObjectTable} />
          </form>
        </div>
      </div>
    )
  }

  register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    const itemNames = formData.getStringAll(ColumnParams.Names)
    const itemValues = formData.getNumberAll(ColumnParams.Values)
    const itemDescriptions = formData.getStringAll(ColumnParams.Descriptions)
    const items: EnumerationItem[] = []
    for (let i = 0; i < itemNames.length; i++) {
      items.push({
        label: itemNames[i],
        value: itemValues[i],
        description: itemDescriptions[i],
      })
    }
    if (this.targetEnumeration) {
      preferences.updateEnumeration(this.targetEnumeration.name, { name, description, items })
    } else {
      preferences.addEnumeration({ name, description, items })
    }
    MJRouter.instance.reload()
  }
}
