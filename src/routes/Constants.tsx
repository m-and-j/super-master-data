import { ConstantTable } from '@/components/data-grid/ConstantTable'
import { Button } from '@/components/inputs/Button'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { ColumnParams, ConstantKind, ConstantKindType, ConstantKindValues } from '@/systems/define'
import { preferences } from '@/systems/preferences'
import { ConstantRaw } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJLink, MJPage, MJRouter } from '@mj/router'

export class Constants extends MJPage {
  private constantTable: Reference<ConstantTable> = ref()

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const items = projectInfo.constants.map((c) => ({ ...c }))
    return (
      <form class="flex h-[calc(100vh-52px)] flex-col p-3 text-sm" onsubmit={(e) => this.register(e)}>
        <div class="mb-3 flex items-center gap-2">
          <div class="font-semibold">定数</div>
          <div class="text-sm text-zinc-400">{items.length} 件</div>
          <div class="flex-auto" />
          <MJLink to="/constants-edit-json" className="text-sm text-blue-500 underline">
            JSON編集
          </MJLink>
          <Button variant="success" size="sm" onclick={() => this.constantTable.value?.addRow()}>
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
        <ConstantTable items={items} ref={this.constantTable} />
      </form>
    )
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const itemNames = formData.getStringAll(ColumnParams.Names)
    const itemLabels = formData.getStringAll(ColumnParams.Labels)
    const itemTypes = formData.getStringAll(ColumnParams.Types)
    const itemValues = formData.getStringAll(ColumnParams.Values)
    const items: ConstantRaw[] = []
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
      await preferences.replaceConstants(items)
      ToastMessage.instance.open('success', '保存しました。')
      MJRouter.instance.reload()
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
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
