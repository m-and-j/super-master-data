import { InputText } from '@/components/inputs/InputText'
import { OutputProjectStandardRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<OutputSourceCodeStandard> {
  outputProjectStandard: OutputProjectStandardRaw
  mode: string
  currentMode: string
}

/**
 * 基本ソースコード出力設定
 */
export class OutputSourceCodeStandard extends MJCustomElement<Props>()(HTMLFieldSetElement) {
  connectedCallback() {
    const { mode, currentMode } = this.props
    this.addClassName(['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', mode !== currentMode && 'hidden'])
  }

  createNode({ outputProjectStandard }: Props) {
    return (
      <>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">出力先ディレクトリ</div>
          <div class="flex-auto">
            <InputText placeholder="出力先ディレクトリ" value={outputProjectStandard.path} onchange={(e) => this.changePath(e)} />
          </div>
        </div>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">ファイル名テンプレート</div>
          <div class="flex-[0_0_250px]">
            <InputText value={outputProjectStandard.fileNameTemplate} onchange={(e) => this.changeFileNameTemplate(e)} />
          </div>
          <div class="flex-auto text-xs text-zinc-400">{`例) {{filename}}Entity, {{filenameKebab}}-schema など`}</div>
        </div>
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_180px] pt-2 text-right text-sm">
            ソースコードテンプレート
            <br />
            (ETA)
          </div>
          <div class="flex-auto">
            <textarea
              class="scrollbar h-[calc(100vh-370px)] w-full resize-none rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none"
              onchange={(e) => this.changeSourceCodeTemplate(e)}
            >
              {outputProjectStandard.sourceCodeTemplate}
            </textarea>
          </div>
        </div>
      </>
    )
  }

  toggle(currentMode: string) {
    const { mode } = this.props
    this.classList.toggle('hidden', mode !== currentMode)
  }

  private changePath(e: Event) {
    const { outputProjectStandard } = this.props
    outputProjectStandard.path = (e.target as HTMLInputElement).value
  }

  private changeFileNameTemplate(e: Event) {
    const { outputProjectStandard } = this.props
    outputProjectStandard.fileNameTemplate = (e.target as HTMLInputElement).value
  }

  private changeSourceCodeTemplate(e: Event) {
    const { outputProjectStandard } = this.props
    outputProjectStandard.sourceCodeTemplate = (e.target as HTMLInputElement).value
  }
}
