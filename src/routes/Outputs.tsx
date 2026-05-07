import Button from '@/components/inputs/Button'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuOutput from '@/components/wayFinders/SideMenuOutput'
import preferences from '@/systems/preferences'
import { OutputItem, OutputProject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { MJPage, MJRouter } from '@mj/router'

export default class Outputs extends MJPage {
  private targetOutput?: OutputProject

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetOutput = projectInfo.outputs.find((s) => s.name === name)
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch">
        {/** 左メニュー */}
        <SideMenuOutput currentName={name} />

        <div class="scrollbar flex-auto overflow-y-scroll">
          <form class="p-2" onsubmit={(e) => this.register(e)}>
            {/** 基本情報 */}
            <div class="mx-1 mb-2 flex items-center gap-2">
              <div class="flex-[0_0_180px] text-right text-sm">出力名</div>
              <div class="flex-[0_0_400px]">
                <InputText name="name" placeholder="例: クライアント用 / サーバー用" value={this.targetOutput?.name} />
              </div>
              <div class="flex-[0_0_50px] text-right text-sm">説明</div>
              <div class="flex-auto">
                <InputText name="description" placeholder="内容" value={this.targetOutput?.description} />
              </div>
            </div>

            <div class="mx-1 mb-2 flex items-center gap-2">
              <div class="flex-[0_0_180px] text-right text-sm">マスターデータ出力先</div>
              <div class="flex-auto">
                <InputText name="dataPath" placeholder="例: ../Client/Assets/MasterData" value={this.targetOutput?.dataPath} />
              </div>
            </div>

            <div class="mx-1 mb-4 flex items-center gap-2">
              <div class="flex-[0_0_180px] text-right text-sm">コード拡張子</div>
              <div class="flex-[0_0_120px]">
                <InputText name="codeExtension" placeholder=".cs" value={this.targetOutput?.codeExtension} />
              </div>
              <div class="flex-auto text-xs text-zinc-400">再出力時に指定された拡張子のファイルをすべて削除してから出力します。</div>
            </div>

            {/** 各ソースコード出力セクション */}
            {this.renderSourceCodeSection('エンティティ', 'entity', this.targetOutput?.entity)}
            {this.renderSourceCodeSection('スキーマ', 'schema', this.targetOutput?.schema)}
            {this.renderSourceCodeSection('列挙型', 'enumeration', this.targetOutput?.enumeration)}

            {/** 保存 / 削除ボタン */}
            <div class="mx-1 mt-6 flex gap-2">
              <div class="flex-auto" />
              <Button type="submit" variant="primary" size="sm">
                <div class="flex items-center justify-center gap-1">
                  <span class="icon-[ic--baseline-save] text-lg"></span>
                  保存
                </div>
              </Button>
              {this.targetOutput && (
                <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
                  <div class="flex items-center justify-center gap-1">
                    <span class="icon-[ic--baseline-delete] text-lg"></span>
                    削除
                  </div>
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  /**
   * Entity / スキーマ / 列挙型 のソースコード出力セクション (出力先パス + EJS テンプレート)
   */
  private renderSourceCodeSection(label: string, fieldPrefix: string, item?: OutputItem) {
    return (
      <fieldset class="mx-1 mt-3 rounded-md border border-zinc-600 p-3">
        <legend class="px-2 text-sm font-semibold">{label}</legend>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_170px] text-right text-sm">出力先パス</div>
          <div class="flex-auto">
            <InputText name={`${fieldPrefix}Path`} placeholder="出力先ディレクトリ" value={item?.path} />
          </div>
        </div>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_170px] text-right text-sm">ファイル名テンプレート</div>
          <div class="flex-[0_0_200px]">
            <InputText name={`${fieldPrefix}FileNameTemplate`} value={item?.fileNameTemplate ?? '{{filename}}'} />
          </div>
          <div class="flex-auto text-xs text-zinc-400">{'例) {{filename}}Entity, {{filename}}Schema など'}</div>
        </div>
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_170px] pt-2 text-right text-sm">ソースコードテンプレート (EJS)</div>
          <div class="flex-auto">
            <textarea
              name={`${fieldPrefix}SourceCodeTemplate`}
              class="scrollbar min-h-[10rem] w-full resize-y rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none"
            >
              {item?.sourceCodeTemplate ?? ''}
            </textarea>
          </div>
        </div>
      </fieldset>
    )
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    const dataPath = formData.getString('dataPath', '')
    const codeExtension = formData.getString('codeExtension', '')
    const entity: OutputItem = {
      path: formData.getString('entityPath', ''),
      fileNameTemplate: formData.getString('entityFileNameTemplate', ''),
      sourceCodeTemplate: formData.getString('entitySourceCodeTemplate', ''),
    }
    const schema: OutputItem = {
      path: formData.getString('schemaPath', ''),
      fileNameTemplate: formData.getString('schemaFileNameTemplate', ''),
      sourceCodeTemplate: formData.getString('schemaSourceCodeTemplate', ''),
    }
    const enumeration: OutputItem = {
      path: formData.getString('enumerationPath', ''),
      fileNameTemplate: formData.getString('enumerationFileNameTemplate', ''),
      sourceCodeTemplate: formData.getString('enumerationSourceCodeTemplate', ''),
    }
    try {
      if (this.targetOutput) {
        await preferences.updateOutput(name, description, dataPath, codeExtension, entity, schema, enumeration)
        MJRouter.instance.reload()
      } else {
        await preferences.addOutput(name, description, dataPath, codeExtension, entity, schema, enumeration)
        MJRouter.instance.push(`/outputs/${name}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    if (this.targetOutput) {
      const { name } = this.targetOutput
      ConfirmModal.instance?.open(`「${name}」を削除します。よろしいですか?`, {
        headerTitle: '削除確認',
        positive: {
          label: '削除',
          variant: 'danger',
          callback: async () => {
            await preferences.deleteOutput(name)
            MJRouter.instance.push('/outputs')
            ToastMessage.instance.open('success', `「${name}」を削除しました。`)
          },
        },
        negative: { label: 'キャンセル', callback: () => {} },
      })
    }
  }
}
