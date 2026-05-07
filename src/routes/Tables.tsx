import Button from '@/components/inputs/Button'
import DataObjectTable from '@/components/inputs/DataObjectTable'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuTable from '@/components/wayFinders/SideMenuTable'
import masterData from '@/systems/master-data'
import { Table } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class Tables extends MJPage {
  private targetTable?: Table
  private dataObjectTable: Reference<DataObjectTable> = ref()

  async beforeRender() {
    const { name } = this.params
    this.targetTable = await masterData.read(name)
  }

  createNode() {
    const { name } = this.params
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch">
        {/** 左メニュー */}
        <SideMenuTable currentName={name} />

        <div class="scrollbar flex-auto overflow-y-scroll">
          <form onsubmit={(e) => this.register(e)}>
            <div class="mx-3 flex items-center gap-2">
              <div class="flex-[0_0_100px] text-right">テーブル名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="テーブル名" value={this.targetTable?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetTable?.description} />
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
              {this.targetTable && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
            <DataObjectTable schemaName={this.targetTable?.name} columns={this.targetTable?.columns} className="mt-2" ref={this.dataObjectTable} />
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
        await masterData.rename(this.targetTable.name, name)
        await masterData.write({ name, description, columns, data: this.targetTable.data })
        MJRouter.instance.reload()
      } else {
        await masterData.write({ name, description, columns, data: [] })
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
      const { name } = this.targetTable
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await masterData.remove(name)
            MJRouter.instance.push('/tables')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
