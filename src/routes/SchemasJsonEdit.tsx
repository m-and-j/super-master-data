import Button from '@/components/inputs/Button'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuSchema from '@/components/wayFinders/SideMenuSchema'
import { DataClassification, DataClassificationType } from '@/systems/define'
import preferences from '@/systems/preferences'
import { DataObject, DataObjectColumn, DataObjectColumnType } from '@/systems/types'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

const VALID_CLASSIFICATIONS: DataClassificationType[] = Object.values(DataClassification)

export default class SchemasJsonEdit extends MJPage {
  private jsonTextarea: Reference<HTMLTextAreaElement> = ref()

  createNode() {
    const projectInfo = preferences.getProjectInfo()
    const jsonText = JSON.stringify(projectInfo.schemas, null, 2)
    return (
      <div class="flex items-stretch min-h-[calc(100vh-52px)]">
        {/** 左メニュー */}
        <SideMenuSchema />

        {/** コンテンツ部分 */}
        <div class="flex-auto">
          <form class="flex flex-col p-2 gap-2 min-h-[calc(100vh-52px)]" onsubmit={(e) => this.saveJson(e)}>
            <div class="flex items-center justify-between">
              <div class="text-sm text-zinc-400">スキーマJSONを直接編集します。</div>
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
    const parsed = this.tryParse(text)
    if (parsed.ok) {
      await preferences.replace({ schemas: parsed.value })
      ToastMessage.instance.open('success', 'JSON を保存しました。')
      MJRouter.instance.reload()
    } else {
      ToastMessage.instance.open('danger', `JSON の保存に失敗しました。\n${parsed.error}`)
    }
  }

  /**
   * テキストを DataObject[] としてパース&ざっくり形式チェック。
   */
  private tryParse(text: string): { ok: true; value: DataObject[] } | { ok: false; error: string } {
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
      const e = parsed[i] as Partial<DataObject> | null | undefined
      if (!e || typeof e !== 'object') {
        return { ok: false, error: `[${i}] がオブジェクトではありません。` }
      }
      if (typeof e.name !== 'string') {
        return { ok: false, error: `[${i}] name が string ではありません。` }
      }
      if (typeof e.description !== 'string') {
        return { ok: false, error: `[${i}] description が string ではありません。` }
      }
      if (!Array.isArray(e.columns)) {
        return { ok: false, error: `[${i}] columns が配列ではありません。` }
      }
      for (let j = 0; j < e.columns.length; j++) {
        const column = e.columns[j] as Partial<DataObjectColumn> | null | undefined
        if (!column || typeof column !== 'object') {
          return { ok: false, error: `[${i}].columns[${j}] がオブジェクトではありません。` }
        }
        if (typeof column.name !== 'string') {
          return { ok: false, error: `[${i}].columns[${j}] name が string ではありません。` }
        }
        if (typeof column.label !== 'string') {
          return { ok: false, error: `[${i}].columns[${j}] label が string ではありません。` }
        }
        if (typeof column.description !== 'string') {
          return { ok: false, error: `[${i}].columns[${j}] description が string ではありません。` }
        }
        const type = column.type as Partial<DataObjectColumnType> | null | undefined
        if (!type || typeof type !== 'object') {
          return { ok: false, error: `[${i}].columns[${j}].type がオブジェクトではありません。` }
        }
        if (typeof type.classification !== 'string' || !VALID_CLASSIFICATIONS.includes(type.classification as DataClassificationType)) {
          return { ok: false, error: `[${i}].columns[${j}].type.classification は ${VALID_CLASSIFICATIONS.join(' / ')} のいずれかである必要があります。` }
        }
        if (typeof type.array !== 'boolean') {
          return { ok: false, error: `[${i}].columns[${j}].type.array が boolean ではありません。` }
        }
        if (typeof type.nullable !== 'boolean') {
          return { ok: false, error: `[${i}].columns[${j}].type.nullable が boolean ではありません。` }
        }
        if (typeof type.typeName !== 'string') {
          return { ok: false, error: `[${i}].columns[${j}].type.typeName が string ではありません。` }
        }
      }
    }
    return { ok: true, value: parsed as DataObject[] }
  }
}
