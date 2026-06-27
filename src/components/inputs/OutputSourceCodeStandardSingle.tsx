import { InputText } from '@/components/inputs/InputText'
import { OutputProjectStandardSingleRaw } from '@/systems/types'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<OutputSourceCodeStandardSingle> {
  outputProjectStandardSingle: OutputProjectStandardSingleRaw
  mode: string
  currentMode: string
}

/**
 * 基本ソースコード出力(単一ファイル)設定
 */
export class OutputSourceCodeStandardSingle extends MJCustomElement<Props>()(HTMLFieldSetElement) {
  connectedCallback() {
    const { mode, currentMode } = this.props
    this.addClassName(['h-[calc(100vh-260px)] rounded-b-md border-x border-b border-zinc-500 p-3', mode !== currentMode && 'hidden'])
  }

  createNode({ outputProjectStandardSingle }: Props) {
    return (
      <>
        <div class="mb-2 flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">出力先ファイル</div>
          <div class="flex-auto">
            <InputText placeholder="出力先ファイル" value={outputProjectStandardSingle.path} onchange={(e) => this.changePath(e)} />
          </div>
        </div>
        <div class="flex items-start gap-2">
          <div class="flex-[0_0_180px] pt-2 text-right text-sm">
            ソースコードテンプレート
            <br />
            (ETA)
          </div>
          <div class="flex-auto">
            <textarea
              class="scrollbar h-[calc(100vh-327px)] w-full resize-none rounded-md border border-zinc-500 bg-zinc-800 p-2 font-mono text-sm leading-5 outline-none"
              onchange={(e) => this.changeSourceCodeTemplate(e)}
            >
              {outputProjectStandardSingle.sourceCodeTemplate}
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
    const { outputProjectStandardSingle } = this.props
    outputProjectStandardSingle.path = (e.target as HTMLInputElement).value
  }

  private changeSourceCodeTemplate(e: Event) {
    const { outputProjectStandardSingle } = this.props
    outputProjectStandardSingle.sourceCodeTemplate = (e.target as HTMLInputElement).value
  }
}
