import Button from '@/components/inputs/Button'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuOutput from '@/components/wayFinders/SideMenuOutput'
import preferences from '@/systems/preferences'
import { OutputProject } from '@/systems/types'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

export default class OUtputsJsonEdit extends MJPage {
  private jsonTextarea: Reference<HTMLTextAreaElement> = ref()

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const jsonText = JSON.stringify(projectInfo.outputs, null, 2)
    return (
      <div class="flex min-h-[calc(100vh-52px)] items-stretch">
        {/** 左メニュー */}
        <SideMenuOutput />

        {/** コンテンツ部分 */}
        <div class="flex-auto">
          <form class="flex min-h-[calc(100vh-52px)] flex-col gap-2 p-2" onsubmit={(e) => this.saveJson(e)}>
            <div class="flex items-center justify-between">
              <div class="text-sm text-zinc-400">出力JSONを直接編集します。</div>
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
      await preferences.replace({ outputs: parsed.value })
      ToastMessage.instance.open('success', 'JSON を保存しました。')
      MJRouter.instance.reload()
    } else {
      ToastMessage.instance.open('danger', `JSON の保存に失敗しました。\n${parsed.error}`)
    }
  }

  /**
   * テキストを OutputProject[] としてパース&ざっくり形式チェック。
   */
  private tryParse(text: string): { ok: true; value: OutputProject[] } | { ok: false; error: string } {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      return { ok: false, error: `JSON の構文エラー: ${e instanceof Error ? e.message : String(e)}` }
    }
    return { ok: true, value: parsed as OutputProject[] }
  }
}
