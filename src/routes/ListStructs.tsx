import { DataObjectCursor } from '@/components/data-grid/DataObjectCursor'
import { DataObjectTable } from '@/components/data-grid/DataObjectTable'
import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuListStruct } from '@/components/wayFinders/SideMenuListStruct'
import { masterListAccessor } from '@/systems/master-list-accessor'
import { preferences } from '@/systems/preferences'
import { TableRaw } from '@/systems/types'
import { deepCopy } from '@/utilities/helper'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export class ListStructs extends MJPage {
  private originalListStruct?: TableRaw
  private editableListStruct: TableRaw = { name: '', description: '', columns: [], data: [] }
  private dataObjectTable: Reference<DataObjectTable> = ref()

  async beforeRender() {
    const { name } = this.params
    this.originalListStruct = await masterListAccessor.read(name)
    if (this.originalListStruct) {
      this.editableListStruct = deepCopy(this.originalListStruct)
    }
  }

  createNode() {
    const { name } = this.params
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr] grid-rows-[90px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuListStruct currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        <div class="flex flex-col justify-center">
          <div class="mx-3 flex items-center gap-2">
            <div class="flex-[0_0_100px] text-right">リスト構造名</div>
            <div class="flex-[0_0_400px]">
              <InputText placeholder="リスト構造名" value={this.editableListStruct.name} onchange={(e) => this.changeName(e)} />
            </div>
            <div class="flex-[0_0_50px] text-right">説明</div>
            <div class="flex-auto">
              <InputText placeholder="内容" value={this.editableListStruct.description} onchange={(e) => this.changeDescription(e)} />
            </div>
          </div>
          <div class="mx-2 mt-3 flex gap-2">
            <Button variant="success" size="sm" onclick={() => this.dataObjectTable.value?.addRow()}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-add] text-lg"></span>
                項目追加
              </div>
            </Button>
            <div class="flex-auto"></div>
            <Button type="button" variant="primary" size="sm" onclick={() => this.register()}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-save] text-lg"></span>
                保存
              </div>
            </Button>
            {this.originalListStruct && (
              <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-delete] text-lg"></span>
                  削除
                </div>
              </Button>
            )}
          </div>
        </div>
        <DataObjectTable columns={this.editableListStruct.columns} ref={this.dataObjectTable} />
        <DataObjectCursor schemaName={this.editableListStruct.name} dataObjectTable={this.dataObjectTable} />
      </div>
    )
  }

  private changeName(e: Event) {
    this.editableListStruct.name = (e.target as HTMLInputElement).value
  }

  private changeDescription(e: Event) {
    this.editableListStruct.description = (e.target as HTMLInputElement).value
  }

  private async register() {
    try {
      if (this.originalListStruct) {
        await masterListAccessor.rename(this.originalListStruct.name, this.editableListStruct.name)
        await preferences.changeListStructName(this.originalListStruct.name, this.editableListStruct.name)
      }
      await masterListAccessor.write(this.editableListStruct)
      MJRouter.instance.push(`/list-structs/${this.editableListStruct.name}`)
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.originalListStruct) {
      const { name } = this.originalListStruct
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await masterListAccessor.remove(name)
            await preferences.deleteListStructName(name)
            MJRouter.instance.push('/list-structs')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
