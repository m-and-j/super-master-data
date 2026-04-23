import Button from '@/components/inputs/Button'
import DataObjectTable from '@/components/inputs/DataObjectTable'
import InputText from '@/components/inputs/InputText'
import preferences from '@/systems/preferences'
import { DataObject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJLink, MJPage, MJRouter } from '@mj/router'

export default class Schemas extends MJPage {
  private targetSchema?: DataObject
  private dataObjectTable: Reference<DataObjectTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetSchema = projectInfo.schemas.find((s) => s.name === name)
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        <div class="flex-[0_0_200px] border-r-3 border-zinc-500 flex flex-col p-2">
          <div class={['px-1', name ? '' : 'bg-zinc-700']}>
            <MJLink to="/schemas" className="text-blue-500">
              新規スキーマ
            </MJLink>
          </div>
          <hr class="my-3 border-zinc-500" />
          {projectInfo.schemas.map((s) => (
            <div class={['px-1', s.name === name ? 'bg-zinc-700' : '']}>
              <MJLink to={`/schemas/${s.name}`} className="text-blue-500">
                {s.name}
              </MJLink>
            </div>
          ))}
        </div>
        <div class="flex-auto">
          <form onsubmit={(e) => this.register(e)}>
            <div class="flex items-center gap-2">
              <div class="flex-[0_0_100px] text-right">スキーマ名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="スキーマ名" value={this.targetSchema?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetSchema?.description} />
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
            <DataObjectTable columns={this.targetSchema?.columns} className="mt-2" ref={this.dataObjectTable} />
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
    const columns = this.dataObjectTable.value?.getColumns() ?? []
    if (this.targetSchema) {
      preferences.updateSchema(this.targetSchema.name, { name, description, columns })
    } else {
      preferences.addSchema({ name, description, columns })
    }
    MJRouter.instance.reload()
  }
}
