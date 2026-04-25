import Button from '@/components/inputs/Button'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuEnumeration from '@/components/wayFinders/SideMenuEnumeration'
import preferences from '@/systems/preferences'
import { EnumerationItem, EnumerationObject } from '@/systems/types'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class EnumerationsJsonEdit extends MJPage {
  private jsonTextarea: Reference<HTMLTextAreaElement> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    const jsonText = JSON.stringify(projectInfo.enumerations, null, 2)
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        {/** 左メニュー */}
        <SideMenuEnumeration name={name} />

        {/** コンテンツ部分 */}
        <div class="flex-auto">
          <form class="flex flex-col p-2 gap-2 min-h-[calc(100vh-52px)]" onsubmit={(e) => this.saveJson(e)}>
            <div class="flex items-center justify-between">
              <div class="text-sm text-zinc-400">列挙型JSONを直接編集します。</div>
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
            </div>
            <textarea
              ref={this.jsonTextarea}
              class="flex-auto w-full bg-zinc-800 border border-zinc-500 rounded-md p-2 font-mono text-sm leading-5 resize-none outline-none min-h-[70vh]"
              style={{ scrollbarColor: '#888 transparent', scrollbarWidth: 'thin' }}
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
    const parsed = this.tryParseEnumerations(text)
    if (parsed.ok) {
      await preferences.replaceEnumerations(parsed.value)
      ToastMessage.instance.open('success', 'JSON を保存しました。')
      MJRouter.instance.reload()
    } else {
      ToastMessage.instance.open('danger', `JSON の保存に失敗しました。\n${parsed.error}`)
    }
  }

  /**
   * テキストを EnumerationObject[] としてパース&ざっくり形式チェック。
   */
  private tryParseEnumerations(text: string): { ok: true; value: EnumerationObject[] } | { ok: false; error: string } {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      return { ok: false, error: `JSON の構文エラー: ${e instanceof Error ? e.message : String(e)}` }
    }
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'ルートは配列である必要があります。' }
    }
    for (let i = 0; i < parsed.length; i++) {
      const e = parsed[i] as Partial<EnumerationObject> | null | undefined
      if (!e || typeof e !== 'object') {
        return { ok: false, error: `[${i}] がオブジェクトではありません。` }
      }
      if (typeof e.name !== 'string') {
        return { ok: false, error: `[${i}] name が string ではありません。` }
      }
      if (typeof e.description !== 'string') {
        return { ok: false, error: `[${i}] description が string ではありません。` }
      }
      if (!Array.isArray(e.items)) {
        return { ok: false, error: `[${i}] items が配列ではありません。` }
      }
      for (let j = 0; j < e.items.length; j++) {
        const item = e.items[j] as Partial<EnumerationItem> | null | undefined
        if (!item || typeof item !== 'object') {
          return { ok: false, error: `[${i}].items[${j}] がオブジェクトではありません。` }
        }
        if (typeof item.label !== 'string') {
          return { ok: false, error: `[${i}].items[${j}] label が string ではありません。` }
        }
        if (typeof item.value !== 'number') {
          return { ok: false, error: `[${i}].items[${j}] value が number ではありません。` }
        }
        if (typeof item.description !== 'string') {
          return { ok: false, error: `[${i}].items[${j}] description が string ではありません。` }
        }
      }
    }
    return { ok: true, value: parsed as EnumerationObject[] }
  }
}
