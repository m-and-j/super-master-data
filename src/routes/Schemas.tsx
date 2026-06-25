import { DataObjectTable } from '@/components/data-grid/DataObjectTable'
import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuSchema } from '@/components/wayFinders/SideMenuSchema'
import { preferences } from '@/systems/preferences'
import { DataStructRaw } from '@/systems/types'
import { deepCopy } from '@/utilities/helper'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export class Schemas extends MJPage {
  private originalSchema?: DataStructRaw
  private editableSchema: DataStructRaw = { name: '', description: '', columns: [] }
  private dataObjectTable: Reference<DataObjectTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.originalSchema = projectInfo.schemas.find((s) => s.name === name)
    if (this.originalSchema) {
      this.editableSchema = deepCopy(this.originalSchema)
    }
    return (
      <div class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr] grid-rows-[90px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuSchema currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        <div class="flex flex-col justify-center">
          <div class="mx-3 flex items-center gap-2">
            <div class="flex-[0_0_100px] text-right">スキーマ名</div>
            <div class="flex-[0_0_400px]">
              <InputText placeholder="スキーマ名" value={this.editableSchema.name} onchange={(e) => this.changeName(e)} />
            </div>
            <div class="flex-[0_0_50px] text-right">説明</div>
            <div class="flex-auto">
              <InputText placeholder="内容" value={this.editableSchema.description} onchange={(e) => this.changeDescription(e)} />
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
            {this.originalSchema && (
              <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-delete] text-lg"></span>
                  削除
                </div>
              </Button>
            )}
          </div>
        </div>
        <DataObjectTable columns={this.editableSchema.columns} ref={this.dataObjectTable} />
      </div>
    )
  }

  private changeName(e: Event) {
    this.editableSchema.name = (e.target as HTMLInputElement).value
  }

  private changeDescription(e: Event) {
    this.editableSchema.description = (e.target as HTMLInputElement).value
  }

  private async register() {
    try {
      if (this.originalSchema) {
        await preferences.updateSchema(this.originalSchema.name, this.editableSchema)
      } else {
        await preferences.addSchema(this.editableSchema)
      }
      MJRouter.instance.push(`/schemas/${this.editableSchema.name}`)
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.originalSchema) {
      const { name } = this.originalSchema
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
