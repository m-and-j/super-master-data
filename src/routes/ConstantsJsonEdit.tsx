import { Button } from '@/components/inputs/Button'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { SideMenuConstant } from '@/components/wayFinders/SideMenuConstant'
import { ConstantKindValues } from '@/systems/define'
import { preferences } from '@/systems/preferences'
import { ConstantGroupItemRaw, ConstantGroupRaw } from '@/systems/types'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export class ConstantsJsonEdit extends MJPage {
  private jsonTextarea: Reference<HTMLTextAreaElement> = ref()

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const jsonText = JSON.stringify(projectInfo.constants, null, 2)
    return (
      <div class="grid min-h-[calc(100vh-52px)] grid-cols-[300px_1fr] text-sm">
        {/** 左メニュー */}
        <SideMenuConstant />

        {/** コンテンツ部分 */}
        <div class="flex-auto">
          <form class="flex min-h-[calc(100vh-52px)] flex-col gap-2 p-2" onsubmit={(e) => this.saveJson(e)}>
            <div class="flex items-center justify-between">
              <div class="text-sm text-zinc-400">定数JSONを直接編集します。</div>
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
            </div>
            <textarea
              ref={this.jsonTextarea}
              class="scrollbar min-h-[70vh] w-full flex-auto resize-none rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none"
            >
              {jsonText}
            </textarea>
          </form>
        </div>
      </div>
    )
  }

  private async saveJson(event: SubmitEvent) {
    event.preventDefault()
    const text = this.jsonTextarea.value?.value ?? ''
    const parsed = this.tryParse(text)
    if (parsed.ok) {
      await preferences.replace({ constants: parsed.value })
      ToastMessage.instance.open('success', 'JSON を保存しました。')
      MJRouter.instance.reload()
    } else {
      ToastMessage.instance.open('danger', `JSON の保存に失敗しました。\n${parsed.error}`)
    }
  }

  /**
   * テキストをパース&ざっくり形式チェック。
   */
  private tryParse(text: string): { ok: true; value: ConstantGroupRaw[] } | { ok: false; error: string } {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      return { ok: false, error: `JSON の構文エラー: ${e instanceof Error ? e.message : String(e)}` }
    }
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'ルートは配列である必要があります。' }
    }
    const validTypes = ConstantKindValues as readonly string[]
    for (let i = 0; i < parsed.length; i++) {
      const c = parsed[i] as Partial<ConstantGroupRaw> | null | undefined
      if (!c || typeof c !== 'object') {
        return { ok: false, error: `[${i}] がオブジェクトではありません。` }
      }
      if (typeof c.name !== 'string') {
        return { ok: false, error: `[${i}] name が string ではありません。` }
      }
      if (typeof c.description !== 'string') {
        return { ok: false, error: `[${i}] description が string ではありません。` }
      }
      if (!Array.isArray(c.items)) {
        return { ok: false, error: `[${i}] items が配列ではありません。` }
      }
      for (let j = 0; j < c.items.length; j++) {
        const item = c.items[j] as Partial<ConstantGroupItemRaw> | null | undefined
        if (!item || typeof item !== 'object') {
          return { ok: false, error: `[${i}].items[${j}] がオブジェクトではありません。` }
        }
        if (typeof item.name !== 'string') {
          return { ok: false, error: `[${i}].items[${j}] name が string ではありません。` }
        }
        if (typeof item.label !== 'string') {
          return { ok: false, error: `[${i}].items[${j}] label が string ではありません。` }
        }
        if (typeof item.type !== 'string' || !validTypes.includes(item.type)) {
          return { ok: false, error: `[${i}].items[${j}] type は ${validTypes.join(' / ')} のいずれかである必要があります。` }
        }
        const valueError = this.validateValue(item.type, item.value, i, j)
        if (valueError) {
          return { ok: false, error: valueError }
        }
      }
    }
    return { ok: true, value: parsed as ConstantGroupRaw[] }
  }

  private validateValue(type: string, value: unknown, i: number, j: number): string | undefined {
    switch (type) {
      case 'int':
      case 'float': {
        if (typeof value !== 'number') {
          return `[${i}].items[${j}] value は number である必要があります。`
        } else {
          return undefined
        }
      }
      case 'string': {
        if (typeof value !== 'string') {
          return `[${i}].items[${j}] value は string である必要があります。`
        } else {
          return undefined
        }
      }
      case 'int[]':
      case 'float[]': {
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'number')) {
          return `[${i}].items[${j}] value は number[] である必要があります。`
        } else {
          return undefined
        }
      }
      case 'string[]': {
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
          return `[${i}].items[${j}] value は string[] である必要があります。`
        } else {
          return undefined
        }
      }
      default: {
        return undefined
      }
    }
  }
}
