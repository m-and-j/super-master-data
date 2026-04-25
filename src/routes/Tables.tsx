import Button from '@/components/inputs/Button'
import DataObjectTable from '@/components/inputs/DataObjectTable'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuTable from '@/components/wayFinders/SideMenuTable'
import preferences from '@/systems/preferences'
import { DataObject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class Tables extends MJPage {
  private targetTable?: DataObject
  private dataObjectTable: Reference<DataObjectTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    const targetTable = projectInfo.tables.find((s) => s.name === name)
    if (targetTable) {
      this.targetTable = JSON.parse(JSON.stringify(targetTable))
    }
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        {/** 左メニュー */}
        <SideMenuTable name={name} />

        <div class="flex-auto">
          <form onsubmit={(e) => this.register(e)}>
            <div class="flex items-center gap-2 mx-3">
              <div class="flex-[0_0_100px] text-right">テーブル名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="テーブル名" value={this.targetTable?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetTable?.description} />
              </div>
            </div>
            <div class="mt-6 mx-2 flex gap-2">
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
              {this.targetTable && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
            <DataObjectTable schemaName={name} columns={this.targetTable?.columns} className="mt-2" ref={this.dataObjectTable} />
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
      if (this.targetTable) {
        await preferences.updateTable(this.targetTable.name, { name, description, columns })
        MJRouter.instance.reload()
      } else {
        await preferences.addTable({ name, description, columns })
        MJRouter.instance.push(`/tables/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetTable) {
      const targetName = this.targetTable.name
      ConfirmModal.instance?.open(`「${targetName}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: { label: '削除', variant: 'danger', callback: () => this.executeDelete(targetName) },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }

  private async executeDelete(name: string) {
    await preferences.deleteTable(name)
    MJRouter.instance.push('/tables')
    ToastMessage.instance.open('success', `「${name}」を削除しました。`)
  }
}
