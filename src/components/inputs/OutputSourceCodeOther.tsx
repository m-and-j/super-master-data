import { Button } from '@/components/inputs/Button'
import { InputText } from '@/components/inputs/InputText'
import { SelectBox } from '@/components/inputs/SelectBox'
import { OutputKind, OutputKindOptions, OutputKindType } from '@/systems/define'
import { OutputProjectOtherRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<OutputSourceCodeOther> {
  outputProjectOther: OutputProjectOtherRaw
  mode: string
  currentMode: string
  removeOther: () => void
}

/**
 * ソースコード出力設定
 */
export class OutputSourceCodeOther extends MJCustomElement<Props>()(HTMLFieldSetElement) {
  connectedCallback() {
    const { mode, currentMode } = this.props
    this.addClassName(['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', mode !== currentMode && 'hidden'])
  }

  createNode({ outputProjectOther, removeOther }: Props) {
    const kind = outputProjectOther.kind
    const pathLabel = kind === OutputKind.Single ? '出力先ファイル' : '出力先ディレクトリ'
    return (
      <>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">名前</div>
          <div class="flex-auto">
            <InputText value={outputProjectOther.name} onchange={(e) => this.changeName(e)} />
          </div>
          <div class="flex-[0_0_140px] text-right text-sm">出力種別</div>
          <div class="flex-auto">
            <SelectBox options={OutputKindOptions} selectedValue={kind} onchange={(e) => this.changeKind(e)} />
          </div>
        </div>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">{pathLabel}</div>
          <div class="flex-auto">
            <InputText placeholder={pathLabel} value={outputProjectOther.path} onchange={(e) => this.changePath(e)} />
          </div>
        </div>
        {kind !== OutputKind.Single && (
          <div class="mb-2 flex items-center gap-2">
            <div class="flex-[0_0_180px] text-right text-sm">ファイル名テンプレート</div>
            <div class="flex-[0_0_250px]">
              <InputText value={outputProjectOther.fileNameTemplate} onchange={(e) => this.changeFileNameTemplate(e)} />
            </div>
            <div class="flex-auto text-xs text-zinc-400">{`例) {{filename}}Entity, {{filenameKebab}}-schema など`}</div>
          </div>
        )}
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_180px] pt-2 text-right text-sm">
            ソースコードテンプレート
            <br />
            (ETA)
          </div>
          <div class="flex-auto">
            <textarea
              class={[
                'scrollbar w-full resize-none rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none',
                kind === OutputKind.Single ? 'h-[calc(100vh-398px)]' : 'h-[calc(100vh-441.5px)]',
              ]}
              onchange={(e) => this.changeSourceCodeTemplate(e)}
            >
              {outputProjectOther.sourceCodeTemplate}
            </textarea>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_180px] text-right text-sm"></div>
          <div class="flex-auto">
            <Button variant="danger" size="sm" onclick={() => removeOther()}>
              <span class="icon-[ic--baseline-delete] text-lg"></span>
              この個別出力設定を削除
            </Button>
          </div>
        </div>
      </>
    )
  }

  toggle(currentMode: string) {
    const { mode } = this.props
    this.classList.toggle('hidden', mode !== currentMode)
  }

  private changeName(e: Event) {
    const { outputProjectOther } = this.props
    outputProjectOther.name = (e.target as HTMLSelectElement).value
  }

  private changeKind(e: Event) {
    const { outputProjectOther } = this.props
    outputProjectOther.kind = (e.target as HTMLSelectElement).value as OutputKindType
    switch (outputProjectOther.kind) {
      case OutputKind.Single: {
        outputProjectOther.fileNameTemplate = undefined
        break
      }
      case OutputKind.MultipleTables:
      case OutputKind.MultipleSchemas:
      case OutputKind.MultipleEnumerations: {
        outputProjectOther.fileNameTemplate = '{{filename}}'
        break
      }
    }
    this.render()
  }

  private changePath(e: Event) {
    const { outputProjectOther } = this.props
    outputProjectOther.path = (e.target as HTMLInputElement).value
  }

  private changeFileNameTemplate(e: Event) {
    const { outputProjectOther } = this.props
    outputProjectOther.fileNameTemplate = (e.target as HTMLInputElement).value
  }

  private changeSourceCodeTemplate(e: Event) {
    const { outputProjectOther } = this.props
    outputProjectOther.sourceCodeTemplate = (e.target as HTMLInputElement).value
  }
}
