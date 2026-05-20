import Button from '@/components/inputs/Button'
import CheckBox from '@/components/inputs/CheckBox'
import InputText from '@/components/inputs/InputText'
import ConfirmModal from '@/components/modals/ConfirmModal'
import ToastMessage from '@/components/notifications/ToastMessage'
import SideMenuOutput from '@/components/wayFinders/SideMenuOutput'
import TabItemButton from '@/components/wayFinders/TabItemButton'
import TabPanel from '@/components/wayFinders/TabPanel'
import masterData from '@/systems/master-data'
import preferences from '@/systems/preferences'
import { OutputItem, OutputProject } from '@/systems/types'
import { FormDataEx } from '@/utilities/helper-frontend'
import { ref, Reference } from '@mj/jsx'
import { MJPage, MJRouter } from '@mj/router'

const Mode = {
  MasterData: 'master-data',
  Entity: 'entity',
  Schema: 'schema',
  Enumeration: 'enumeration',
} as const
type ModeType = (typeof Mode)[keyof typeof Mode]

export default class Outputs extends MJPage {
  private targetOutput?: OutputProject
  private mode: ModeType = Mode.MasterData
  private masterFieldset: Reference<HTMLFieldSetElement> = ref()
  private entityFieldset: Reference<HTMLFieldSetElement> = ref()
  private schemaFieldset: Reference<HTMLFieldSetElement> = ref()
  private enumerationFieldset: Reference<HTMLFieldSetElement> = ref()
  private form: Reference<HTMLFormElement> = ref()

  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    this.targetOutput = projectInfo.outputs.find((s) => s.name === name)
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch text-sm">
        {/** 左メニュー */}
        <SideMenuOutput currentName={name} />

        {/** コンテンツ */}
        <form class="flex-auto p-2" onsubmit={(e) => this.register(e)} ref={this.form}>
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
          <div class="mx-1 mb-3 flex items-center gap-2">
            <div class="flex-[0_0_180px] text-right text-sm">コード拡張子</div>
            <div class="flex-[0_0_120px]">
              <InputText name="codeExtension" placeholder="例: cs" value={this.targetOutput?.codeExtension} />
            </div>
            <div class="flex-auto text-xs text-zinc-400">再出力時に指定された拡張子のファイルをすべて削除してから出力します。</div>
          </div>

          {/** 各ソースコード出力セクション */}
          <TabPanel>
            <TabItemButton name={Mode.MasterData} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.MasterData}>
              マスターデータ
            </TabItemButton>
            <TabItemButton name={Mode.Entity} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Entity}>
              エンティティ
            </TabItemButton>
            <TabItemButton name={Mode.Schema} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Schema}>
              スキーマ
            </TabItemButton>
            <TabItemButton name={Mode.Enumeration} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Enumeration}>
              列挙型
            </TabItemButton>
          </TabPanel>
          <fieldset class={['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', this.mode !== Mode.MasterData && 'hidden']} ref={this.masterFieldset}>
            <div class="mb-2 flex items-center gap-2">
              <div class="flex-[0_0_180px] text-right text-sm">出力先パス</div>
              <div class="flex-auto">
                <InputText name="dataPath" placeholder="例: ../Client/Assets/MasterData" value={this.targetOutput?.dataPath} />
              </div>
            </div>
            <div class="mb-2 flex items-start gap-2">
              <div class="flex-[0_0_180px] pt-2 text-right text-sm">出力対象</div>
              <div class="scrollbar flex h-[calc(100vh-330px)] flex-auto flex-col items-start overflow-y-scroll rounded-md border border-zinc-500">
                {masterData.getNames().map((name) => (
                  <CheckBox
                    name="targetMasterData"
                    value={name}
                    checked={this.targetOutput?.targetMasterData.includes(name)}
                    labelClassName="px-2 py-0.5 w-full hover:bg-indigo-700"
                  >
                    {name}
                  </CheckBox>
                ))}
              </div>
              <div class="flex flex-col gap-1">
                <Button type="button" variant="success" size="sm" onclick={() => this.selectAllMasterData()}>
                  すべて選択
                </Button>
                <Button type="button" variant="secondary" size="sm" onclick={() => this.deselectAllMasterData()}>
                  すべて解除
                </Button>
              </div>
            </div>
          </fieldset>
          {this.renderSourceCodeSection(Mode.Entity)}
          {this.renderSourceCodeSection(Mode.Schema)}
          {this.renderSourceCodeSection(Mode.Enumeration)}

          {/** 保存 / 削除ボタン */}
          <div class="mx-1 mt-4 flex gap-2">
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
    )
  }

  /**
   * ソースコード出力セクション
   */
  private renderSourceCodeSection(mode: ModeType) {
    const outputPathName = `${mode}Path`
    const fileNameTemplateName = `${mode}FileNameTemplate`
    const sourceCodeTemplateName = `${mode}SourceCodeTemplate`
    let outputItem
    let fileNameTemplateHint
    let ref
    switch (mode) {
      case Mode.Entity: {
        outputItem = this.targetOutput?.entity
        fileNameTemplateHint = '例) {{filename}}Entity, {{filenameKebab}}-entity など'
        ref = this.entityFieldset
        break
      }
      case Mode.Schema: {
        outputItem = this.targetOutput?.schema
        fileNameTemplateHint = '例) {{filename}}Schema, {{filenameKebab}}-schema など'
        ref = this.schemaFieldset
        break
      }
      case Mode.Enumeration: {
        outputItem = this.targetOutput?.enumeration
        fileNameTemplateHint = '例) {{filename}}Enum, {{filenameKebab}}-enum など'
        ref = this.enumerationFieldset
        break
      }
    }
    return (
      <fieldset class={['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', this.mode !== mode && 'hidden']} ref={ref}>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">出力先パス</div>
          <div class="flex-auto">
            <InputText name={outputPathName} placeholder="出力先ディレクトリ" value={outputItem?.path} />
          </div>
        </div>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">ファイル名テンプレート</div>
          <div class="flex-[0_0_250px]">
            <InputText name={fileNameTemplateName} value={outputItem?.fileNameTemplate ?? '{{filename}}'} />
          </div>
          <div class="flex-auto text-xs text-zinc-400">{fileNameTemplateHint}</div>
        </div>
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_180px] pt-2 text-right text-sm">
            ソースコードテンプレート
            <br />
            (ETA)
          </div>
          <div class="flex-auto">
            <textarea
              name={sourceCodeTemplateName}
              class="scrollbar h-[calc(100vh-370px)] w-full resize-none rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none"
            >
              {outputItem?.sourceCodeTemplate ?? ''}
            </textarea>
          </div>
        </div>
      </fieldset>
    )
  }

  private changeTab(mode: string) {
    this.mode = mode as ModeType
    this.masterFieldset.value?.classList.toggle('hidden', this.mode !== Mode.MasterData)
    this.entityFieldset.value?.classList.toggle('hidden', this.mode !== Mode.Entity)
    this.schemaFieldset.value?.classList.toggle('hidden', this.mode !== Mode.Schema)
    this.enumerationFieldset.value?.classList.toggle('hidden', this.mode !== Mode.Enumeration)
  }

  private selectAllMasterData() {
    this.form.value?.querySelectorAll<HTMLInputElement>('input[name="targetMasterData"][type="checkbox"]').forEach((checkbox) => (checkbox.checked = true))
  }

  private deselectAllMasterData() {
    this.form.value?.querySelectorAll<HTMLInputElement>('input[name="targetMasterData"][type="checkbox"]').forEach((checkbox) => (checkbox.checked = false))
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormDataEx(event)
    const name = formData.getString('name', '')
    const description = formData.getString('description', '')
    const dataPath = formData.getString('dataPath', '')
    const targetMasterData = formData.getStringAll('targetMasterData')
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
        await preferences.updateOutput(name, description, dataPath, targetMasterData, codeExtension, entity, schema, enumeration)
        MJRouter.instance.reload()
      } else {
        await preferences.addOutput(name, description, dataPath, targetMasterData, codeExtension, entity, schema, enumeration)
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
