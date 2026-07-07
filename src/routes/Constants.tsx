import { ConstantTable } from '@/components/data-grid/ConstantTable'
import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuConstant } from '@/components/wayFinders/SideMenuConstant'
import { ColumnParams, ConstantKind, ConstantKindType, ConstantKindValues } from '@/systems/define'
import { preferences } from '@/systems/preferences'
import { ConstantGroupItemRaw, ConstantGroupRaw } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export class Constants extends MJPage {
  private targetConstant?: ConstantGroupRaw
  private constantTable: Reference<ConstantTable> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetConstant = projectInfo.constants.find((c) => c.name === name)
    return (
      <form class="grid h-[calc(100vh-52px)] grid-cols-[300px_1fr] grid-rows-[90px_1fr] text-sm" onsubmit={(e) => this.register(e)}>
        {/** 左メニュー */}
        <SideMenuConstant currentName={name} className="row-span-2" />

        {/** コンテンツ */}
        <div class="flex flex-col justify-center">
          <div class="mx-3 flex items-center gap-2">
            <div class="flex-[0_0_100px] text-right">グループ名</div>
            <div class="flex-[0_0_400px]">
              <InputText name="name" placeholder="グループ名" value={this.targetConstant?.name} />
            </div>
            <div class="flex-[0_0_50px] text-right">説明</div>
            <div class="flex-auto">
              <InputText name="description" placeholder="内容" value={this.targetConstant?.description} />
            </div>
          </div>
          <div class="mx-2 mt-3 flex gap-2">
            <Button variant="success" size="sm" onclick={() => this.constantTable.value?.addRow()}>
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
            {this.targetConstant && (
              <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-delete] text-lg"></span>
                  削除
                </div>
              </Button>
            )}
          </div>
        </div>
        <ConstantTable items={this.targetConstant?.items ?? []} ref={this.constantTable} />
      </form>
    )
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    const itemNames = formData.getStringAll(ColumnParams.Names)
    const itemLabels = formData.getStringAll(ColumnParams.Labels)
    const itemTypes = formData.getStringAll(ColumnParams.Types)
    const itemValues = formData.getStringAll(ColumnParams.Values)
    const items: ConstantGroupItemRaw[] = []
    for (let i = 0; i < itemNames.length; i++) {
      const type = this.toConstantKind(itemTypes[i])
      items.push({
        name: itemNames[i],
        label: itemLabels[i],
        type,
        value: this.parseValue(type, itemValues[i]),
      })
    }
    try {
      if (this.targetConstant) {
        await preferences.updateConstant(this.targetConstant.name, { name, description, items })
        MJRouter.instance.push(`/constants/${name}`)
      } else {
        await preferences.addConstant({ name, description, items })
        MJRouter.instance.push(`/constants/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetConstant) {
      const { name } = this.targetConstant
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await preferences.deleteConstant(name)
            MJRouter.instance.push('/constants')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }

  private toConstantKind(raw: string): ConstantKindType {
    if ((ConstantKindValues as readonly string[]).includes(raw)) {
      return raw as ConstantKindType
    } else {
      return ConstantKind.Int
    }
  }

  private parseValue(type: ConstantKindType, raw: string): number | string | number[] | string[] {
    switch (type) {
      case ConstantKind.Int: {
        const num = parseInt(raw, 10)
        return isNaN(num) ? 0 : num
      }
      case ConstantKind.Float: {
        const num = parseFloat(raw)
        return isNaN(num) ? 0 : num
      }
      case ConstantKind.String: {
        return raw
      }
      case ConstantKind.IntArray: {
        return this.parseJsonArray(raw, (v) => (typeof v === 'number' && Number.isInteger(v) ? v : 0))
      }
      case ConstantKind.FloatArray: {
        return this.parseJsonArray(raw, (v) => (typeof v === 'number' ? v : 0))
      }
      case ConstantKind.StringArray: {
        return this.parseJsonArray(raw, (v) => (typeof v === 'string' ? v : String(v)))
      }
      default: {
        return raw
      }
    }
  }

  private parseJsonArray<T extends number | string>(raw: string, coerce: (v: unknown) => T): T[] {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map(coerce)
      } else {
        return []
      }
    } catch (e) {
      return []
    }
  }
}
