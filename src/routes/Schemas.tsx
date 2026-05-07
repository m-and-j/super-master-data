import Button from '@/components/inputs/Button'
import DataObjectTable from '@/components/inputs/DataObjectTable'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuSchema from '@/components/wayFinders/SideMenuSchema'
import preferences from '@/systems/preferences'
import { DataObject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class Schemas extends MJPage {
  private targetSchema?: DataObject
  private dataObjectTable: Reference<DataObjectTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    const targetSchema = projectInfo.schemas.find((s) => s.name === name)
    if (targetSchema) {
      this.targetSchema = JSON.parse(JSON.stringify(targetSchema))
    }
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch">
        {/** 左メニュー */}
        <SideMenuSchema currentName={name} />

        <div class="scrollbar flex-auto overflow-y-scroll">
          <form onsubmit={(e) => this.register(e)}>
            <div class="mx-3 flex items-center gap-2">
              <div class="flex-[0_0_100px] text-right">スキーマ名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="スキーマ名" value={this.targetSchema?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetSchema?.description} />
              </div>
            </div>
            <div class="mx-2 mt-6 flex gap-2">
              <Button variant="success" size="sm" onclick={() => this.dataObjectTable.value?.addRow()}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-add] text-lg"></span>
                  項目追加
                </div>
              </Button>
              <div class="flex-auto"></div>
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
              {this.targetSchema && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
            <DataObjectTable schemaName={this.targetSchema?.name} columns={this.targetSchema?.columns} className="mt-2" ref={this.dataObjectTable} />
          </form>
        </div>
      </div>
    )
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    const columns = this.dataObjectTable.value?.getColumns() ?? []
    try {
      if (this.targetSchema) {
        await preferences.updateSchema(name, description, columns)
        MJRouter.instance.reload()
      } else {
        await preferences.addSchema(name, description, columns)
        MJRouter.instance.push(`/schemas/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetSchema) {
      const { name } = this.targetSchema
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await preferences.deleteSchema(name)
            MJRouter.instance.push('/schemas')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
