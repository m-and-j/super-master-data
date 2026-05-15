import EnumerationTable from '@/components/data-grid/EnumerationTable'
import Button from '@/components/inputs/Button'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuEnumeration from '@/components/wayFinders/SideMenuEnumeration'
import { ColumnParams } from '@/systems/define'
import preferences from '@/systems/preferences'
import { EnumerationItem, EnumerationObject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class Enumerations extends MJPage {
  private targetEnumeration?: EnumerationObject
  private dataObjectTable: Reference<EnumerationTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetEnumeration = projectInfo.enumerations.find((e) => e.name === name)
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch">
        {/** 左メニュー */}
        <SideMenuEnumeration currentName={name} className="flex-[0_0_300px]" />

        {/** コンテンツ部分 */}
        <div class="scrollbar flex-auto overflow-y-scroll">
          <form onsubmit={(e) => this.register(e)}>
            <div class="mx-3 flex items-center gap-2">
              <div class="flex-[0_0_100px] text-right">列挙型名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="列挙型名" value={this.targetEnumeration?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetEnumeration?.description} />
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
              {this.targetEnumeration && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
            <EnumerationTable items={this.targetEnumeration?.items} className="mt-2" ref={this.dataObjectTable} />
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
    try {
      if (this.targetEnumeration) {
        await preferences.updateEnumeration(name, description, items)
        MJRouter.instance.reload()
      } else {
        await preferences.addEnumeration(name, description, items)
        MJRouter.instance.push(`/enumerations/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetEnumeration) {
      const { name } = this.targetEnumeration
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await preferences.deleteEnumeration(name)
            MJRouter.instance.push('/enumerations')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
