import { Button } from '@/components/inputs/Button'
import { CheckBox } from '@/components/inputs/CheckBox'
import { InputText } from '@/components/inputs/InputText'
import { OutputData } from '@/systems/output-distributors/output-project'
import { MJ, MJCustomElement } from '@mj/jsx'

interface Props extends MJ.CEProps<OutputDataList> {
  outputData: OutputData
  dataNames: string[]
  title: string
  outputTargetFlex: number
}

/**
 * JSONデータ出力設定
 */
export class OutputDataList extends MJCustomElement<Props>()(HTMLDivElement) {
  connectedCallback() {
    this.addClassName('contents')
  }

  createNode({ outputData, dataNames, title, outputTargetFlex }: Props) {
    return (
      <>
        <div class="border-b border-l-6 border-zinc-500 py-1 pl-2 text-lg font-bold">{title}</div>
        <div class="flex items-center gap-2">
          <div class="flex-[0_0_180px] text-right text-sm">出力先パス</div>
          <div class="flex-auto">
            <InputText placeholder="例: ../Client/Assets/MasterData" value={outputData.getPath()} onchange={(e) => outputData.changePath(e)} />
          </div>
        </div>
        <div class="flex min-h-0 gap-2" style={{ flex: `${outputTargetFlex}` }}>
          <div class="flex-[0_0_180px] pt-2 text-right text-sm">出力対象</div>
          <div class="scrollbar flex-auto overflow-y-scroll rounded-md border border-zinc-500">
            {dataNames.map((name) => (
              <CheckBox value={name} checked={outputData.hasTarget(name)} labelClassName="px-2 py-0.5 w-full hover:bg-indigo-700" onchange={(e) => outputData.changeTarget(e)}>
                {name}
              </CheckBox>
            ))}
          </div>
          <div class="flex flex-col gap-1">
            <Button type="button" variant="success" size="sm" onclick={() => this.selectAll()}>
              すべて選択
            </Button>
            <Button type="button" variant="secondary" size="sm" onclick={() => this.deselectAll()}>
              すべて解除
            </Button>
          </div>
        </div>
      </>
    )
  }

  private selectAll() {
    const { outputData, dataNames } = this.props
    outputData.allCheckTargets(dataNames)
    this.render()
  }

  private deselectAll() {
    const { outputData } = this.props
    outputData.allClearTargets()
    this.render()
  }
}
