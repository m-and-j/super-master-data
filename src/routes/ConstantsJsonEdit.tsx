import { Button } from '@/components/inputs/Button'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { ConstantKindValues } from '@/systems/define'
import { preferences } from '@/systems/preferences'
import { ConstantRaw } from '@/systems/types'
import { ref, Reference } from '@mj/jsx'
import { MJLink, MJPage, MJRouter } from '@mj/router'

export class ConstantsJsonEdit extends MJPage {
  private jsonTextarea: Reference<HTMLTextAreaElement> = ref()

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const jsonText = JSON.stringify(projectInfo.constants, null, 2)
    return (
      <form class="flex min-h-[calc(100vh-52px)] flex-col gap-2 p-2" onsubmit={(e) => this.saveJson(e)}>
        <div class="flex items-center gap-2">
          <div class="text-sm text-zinc-400">定数JSONを直接編集します。</div>
          <div class="flex-auto" />
          <MJLink to="/constants" className="text-blue-500 underline text-sm">
            通常編集に戻る
          </MJLink>
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
  private tryParse(text: string): { ok: true; value: ConstantRaw[] } | { ok: false; error: string } {
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
      const c = parsed[i] as Partial<ConstantRaw> | null | undefined
      if (!c || typeof c !== 'object') {
        return { ok: false, error: `[${i}] がオブジェクトではありません。` }
      }
      if (typeof c.name !== 'string') {
        return { ok: false, error: `[${i}] name が string ではありません。` }
      }
      if (typeof c.label !== 'string') {
        return { ok: false, error: `[${i}] label が string ではありません。` }
      }
      if (typeof c.type !== 'string' || !validTypes.includes(c.type)) {
        return { ok: false, error: `[${i}] type は ${validTypes.join(' / ')} のいずれかである必要があります。` }
      }
      const valueError = this.validateValue(c.type, c.value, i)
      if (valueError) {
        return { ok: false, error: valueError }
      }
    }
    return { ok: true, value: parsed as ConstantRaw[] }
  }

  private validateValue(type: string, value: unknown, index: number): string | undefined {
    switch (type) {
      case 'int':
      case 'float': {
        if (typeof value !== 'number') {
          return `[${index}] value は number である必要があります。`
        } else {
          return undefined
        }
      }
      case 'string': {
        if (typeof value !== 'string') {
          return `[${index}] value は string である必要があります。`
        } else {
          return undefined
        }
      }
      case 'int[]':
      case 'float[]': {
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'number')) {
          return `[${index}] value は number[] である必要があります。`
        } else {
          return undefined
        }
      }
      case 'string[]': {
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
          return `[${index}] value は string[] である必要があります。`
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
