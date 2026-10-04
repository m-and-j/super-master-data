import { DataObjectCursor } from '@/components/data-grid/DataObjectCursor'
import { DataObjectTable } from '@/components/data-grid/DataObjectTable'
import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuTable } from '@/components/wayFinders/SideMenuTable'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { TableRaw } from '@/systems/types'
import { deepCopy } from '@/utilities/helper'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export class Tables extends MJPage {
  private editableTable: TableRaw = { name: '', description: '', columns: [], data: [] }
  private dataObjectTable: Reference<DataObjectTable> = ref()

  createNode() {
    const { name } = this.params
    const originalTable = masterDataAccessor.get(name)
    if (originalTable) {
      this.editableTable = deepCopy(originalTable)
    }
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr] grid-rows-[90px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuTable currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        <div class="flex flex-col justify-center">
          <div class="mx-3 flex items-center gap-2">
            <div class="flex-[0_0_100px] text-right">テーブル名</div>
            <div class="flex-[0_0_400px]">
              <InputText placeholder="テーブル名" value={this.editableTable.name} onchange={(e) => this.changeName(e)} />
            </div>
            <div class="flex-[0_0_50px] text-right">説明</div>
            <div class="flex-auto">
              <InputText placeholder="内容" value={this.editableTable.description} onchange={(e) => this.changeDescription(e)} />
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
            <Button type="button" variant="success" size="xs" onclick={() => this.dataObjectTable.value?.moveUp()}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-arrow-upward] text-lg"></span>
              </div>
            </Button>
            <Button type="button" variant="success" size="xs" onclick={() => this.dataObjectTable.value?.moveDown()}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-arrow-downward] text-lg"></span>
              </div>
            </Button>
            <Button type="button" variant="primary" size="sm" onclick={() => this.register(originalTable)}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-save] text-lg"></span>
                保存
              </div>
            </Button>
            {originalTable && (
              <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete(originalTable)}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-delete] text-lg"></span>
                  削除
                </div>
              </Button>
            )}
          </div>
        </div>
        <DataObjectTable columns={this.editableTable.columns} ref={this.dataObjectTable} />
        <DataObjectCursor schemaName={this.editableTable.name} dataObjectTable={this.dataObjectTable} enabledIdColumn />
      </div>
    )
  }

  private changeName(e: Event) {
    this.editableTable.name = (e.target as HTMLInputElement).value
  }

  private changeDescription(e: Event) {
    this.editableTable.description = (e.target as HTMLInputElement).value
  }

  private async register(originalTable?: TableRaw) {
    try {
      await masterDataAccessor.write(this.editableTable, originalTable?.name)
      MJRouter.instance.push(`/tables/${this.editableTable.name}`)
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete(originalTable?: TableRaw) {
    if (originalTable) {
      ConfirmModal.instance?.open(`「${originalTable.name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await masterDataAccessor.remove(originalTable)
            MJRouter.instance.push('/tables')
            ToastMessage.instance.open('success', `「${originalTable.name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
