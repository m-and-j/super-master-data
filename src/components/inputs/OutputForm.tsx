import { Button } from '@/components/inputs/Button'
import { CheckBox } from '@/components/inputs/CheckBox'
import { InputText } from '@/components/inputs/InputText'
import { OutputSourceCodeOther } from '@/components/inputs/OutputSourceCodeOther'
import { OutputSourceCodeStandardMultiple } from '@/components/inputs/OutputSourceCodeStandardMultiple'
import { OutputSourceCodeStandardSingle } from '@/components/inputs/OutputSourceCodeStandardSingle'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { ToastMessage } from '@/components/notifications/ToastMessage'
import { TabItem } from '@/components/wayFinders/TabItem'
import { TabPanel } from '@/components/wayFinders/TabPanel'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputProject } from '@/systems/output-distributor/output-project'
import { preferences } from '@/systems/preferences'
import { OutputProjectRaw } from '@/systems/types'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'
import { MJRouter } from '@mj/router'

interface Props extends MJ.CEProps<OutputForm> {
  targetOutput?: OutputProjectRaw
}

const Mode = {
  MasterData: 'master-data',
  Entity: 'entity',
  Schema: 'schema',
  Enumeration: 'enumeration',
  Constant: 'constant',
} as const

/**
 * マスターデータ出力設定
 */
export class OutputForm extends MJCustomElement<Props>()(HTMLFormElement) {
  private mode: string = Mode.MasterData
  private outputProject = new OutputProject()
  private masterFieldset: Reference<HTMLFieldSetElement> = ref()
  private entityOutputSourceCode: Reference<OutputSourceCodeStandardMultiple> = ref()
  private schemaOutputSourceCode: Reference<OutputSourceCodeStandardMultiple> = ref()
  private enumerationOutputSourceCode: Reference<OutputSourceCodeStandardMultiple> = ref()
  private constantOutputSourceCode: Reference<OutputSourceCodeStandardSingle> = ref()
  private otherOutputSourceCodeList: Reference<OutputSourceCodeOther>[] = []

  connectedCallback() {
    this.addClassName('flex-auto p-2')
    this.addEventListener('submit', (e) => this.register(e))
  }

  async initialize({ targetOutput }: Props) {
    this.outputProject.setRaw(targetOutput)
  }

  createNode({ targetOutput }: Props) {
    this.outputProject.getOthers().forEach(() => this.otherOutputSourceCodeList.push(ref()))
    return (
      <>
        {/** 基本情報 */}
        <div class="mx-1 mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">出力名</div>
          <div class="flex-[0_0_400px]">
            <InputText placeholder="例: クライアント用 / サーバー用" value={this.outputProject.getName()} onchange={(e) => this.outputProject.changeName(e)} />
          </div>
          <div class="flex-[0_0_50px] text-right text-sm">説明</div>
          <div class="flex-auto">
            <InputText placeholder="内容" value={this.outputProject.getDescription()} onchange={(e) => this.outputProject.changeDescription(e)} />
          </div>
        </div>
        <div class="mx-1 mb-3 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">コード拡張子</div>
          <div class="flex-[0_0_120px]">
            <InputText placeholder="例: cs" value={this.outputProject.getCodeExtension()} onchange={(e) => this.outputProject.changeCodeExtension(e)} />
          </div>
          <div class="flex-auto text-xs text-zinc-400">再出力時に指定された拡張子のファイルをすべて削除してから出力します。</div>
        </div>

        {/** 各ソースコード出力セクション */}
        <TabPanel>
          <TabItem type="change" name={Mode.MasterData} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.MasterData}>
            マスターデータ
          </TabItem>
          <TabItem type="change" name={Mode.Entity} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Entity}>
            エンティティ
          </TabItem>
          <TabItem type="change" name={Mode.Schema} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Schema}>
            スキーマ
          </TabItem>
          <TabItem type="change" name={Mode.Enumeration} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Enumeration}>
            列挙型
          </TabItem>
          <TabItem type="change" name={Mode.Constant} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === Mode.Constant}>
            定数
          </TabItem>
          {this.outputProject.getOthers().map((item, index) => (
            <TabItem type="change" name={`${index}`} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === `${index}`}>
              {item.name}
            </TabItem>
          ))}
          <TabItem type="button" onclick={() => this.addOutputSourceCodeOther()}>
            <span class="icon-[ic--baseline-library-add] text-2xl"></span>
          </TabItem>
        </TabPanel>
        <fieldset class={['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', this.mode !== Mode.MasterData && 'hidden']} ref={this.masterFieldset}>
          <div class="mb-2 flex items-center gap-2">
            <div class="flex-[0_0_180px] text-right text-sm">出力先パス</div>
            <div class="flex-auto">
              <InputText
                placeholder="例: ../Client/Assets/MasterData"
                value={this.outputProject.getMasterDataPath()}
                onchange={(e) => this.outputProject.changeMasterDataPath(e)}
              />
            </div>
          </div>
          <div class="mb-2 flex items-start gap-2">
            <div class="flex-[0_0_180px] pt-2 text-right text-sm">出力対象</div>
            <div class="scrollbar flex h-[calc(100vh-330px)] flex-auto flex-col items-start overflow-y-scroll rounded-md border border-zinc-500">
              {masterDataAccessor.getNames().map((name) => (
                <CheckBox
                  value={name}
                  checked={this.outputProject.hasMasterDataTarget(name)}
                  labelClassName="px-2 py-0.5 w-full hover:bg-indigo-700"
                  onchange={(e) => this.outputProject.changeMasterDataTarget(e)}
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
        <OutputSourceCodeStandardMultiple
          outputProjectStandardMultiple={this.outputProject.getEntity()}
          mode={Mode.Entity}
          currentMode={this.mode}
          ref={this.entityOutputSourceCode}
        />
        <OutputSourceCodeStandardMultiple
          outputProjectStandardMultiple={this.outputProject.getSchema()}
          mode={Mode.Schema}
          currentMode={this.mode}
          ref={this.schemaOutputSourceCode}
        />
        <OutputSourceCodeStandardMultiple
          outputProjectStandardMultiple={this.outputProject.getEnumeration()}
          mode={Mode.Enumeration}
          currentMode={this.mode}
          ref={this.enumerationOutputSourceCode}
        />
        <OutputSourceCodeStandardSingle
          outputProjectStandardSingle={this.outputProject.getConstant()}
          mode={Mode.Constant}
          currentMode={this.mode}
          ref={this.constantOutputSourceCode}
        />
        {this.outputProject.getOthers().map((item, index) => (
          <OutputSourceCodeOther
            outputProjectOther={item}
            mode={`${index}`}
            currentMode={this.mode}
            removeOther={() => this.removeOutputSourceCodeOther(index)}
            ref={this.otherOutputSourceCodeList[index]}
          />
        ))}

        {/** 保存 / 削除ボタン */}
        <div class="mx-1 mt-4 flex gap-2">
          <div class="flex-auto" />
          <Button type="submit" variant="primary" size="sm">
            <div class="flex items-center justify-center gap-1">
              <span class="icon-[ic--baseline-save] text-lg"></span>
              保存
            </div>
          </Button>
          {targetOutput && (
            <Button type="button" variant="danger" size="sm" onclick={() => this.confirmDelete()}>
              <div class="flex items-center justify-center gap-1">
                <span class="icon-[ic--baseline-delete] text-lg"></span>
                削除
              </div>
            </Button>
          )}
        </div>
      </>
    )
  }

  private changeTab(mode: string) {
    this.mode = mode
    this.masterFieldset.value?.classList.toggle('hidden', this.mode !== Mode.MasterData)
    this.entityOutputSourceCode.value?.toggle(this.mode)
    this.schemaOutputSourceCode.value?.toggle(this.mode)
    this.enumerationOutputSourceCode.value?.toggle(this.mode)
    this.constantOutputSourceCode.value?.toggle(this.mode)
    for (const outputSourceCode of this.otherOutputSourceCodeList) {
      outputSourceCode.value?.toggle(this.mode)
    }
  }

  private addOutputSourceCodeOther() {
    const newIndex = this.outputProject.addOther()
    this.mode = `${newIndex}`
    this.render()
  }

  private removeOutputSourceCodeOther(index: number) {
    this.outputProject.removeOther(index)
    this.mode = Mode.MasterData
    this.render()
  }

  private selectAllMasterData() {
    this.outputProject.allCheckMasterDataTargets()
    this.render()
  }

  private deselectAllMasterData() {
    this.outputProject.allClearMasterDataTargets()
    this.render()
  }

  private async register(event: SubmitEvent) {
    event.preventDefault()
    const { targetOutput } = this.props
    try {
      if (targetOutput) {
        await preferences.updateOutput(this.outputProject.toRaw())
        this.render()
      } else {
        await preferences.addOutput(this.outputProject.toRaw())
        MJRouter.instance.push(`/outputs/${this.outputProject.getName()}`)
      }
      ToastMessage.instance.open('success', '保存しました。')
    } catch (e) {
      if (e instanceof Error) {
        ToastMessage.instance.open('danger', e.message)
      }
    }
  }

  private confirmDelete() {
    const { targetOutput } = this.props
    if (targetOutput) {
      const { name } = targetOutput
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
