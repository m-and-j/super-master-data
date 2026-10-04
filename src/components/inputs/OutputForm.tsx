import { OutputDataList } from '@/components/inputs/OutputDataList'
import { OutputSourceCodeOther } from '@/components/inputs/OutputSourceCodeOther'
import { OutputSourceCodeStandard } from '@/components/inputs/OutputSourceCodeStandard'
import { TabItem } from '@/components/wayFinders/TabItem'
import { TabPanel } from '@/components/wayFinders/TabPanel'
import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { MJ, MJCustomElement, ref, Reference } from '@mj/jsx'

interface Props extends MJ.CEProps<OutputForm> {
  outputProject: OutputProject
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
export class OutputForm extends MJCustomElement<Props>()(HTMLDivElement) {
  private mode: string = Mode.MasterData
  private masterFieldset: Reference<HTMLFieldSetElement> = ref()
  private entityOutputSourceCode: Reference<OutputSourceCodeStandard> = ref()
  private schemaOutputSourceCode: Reference<OutputSourceCodeStandard> = ref()
  private enumerationOutputSourceCode: Reference<OutputSourceCodeStandard> = ref()
  private constantOutputSourceCode: Reference<OutputSourceCodeStandard> = ref()
  private otherOutputSourceCodeList: Reference<OutputSourceCodeOther>[] = []

  createNode({ outputProject }: Props) {
    outputProject.getOthers().forEach(() => this.otherOutputSourceCodeList.push(ref()))
    return (
      <>
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
          {outputProject.getOthers().map((item, index) => (
            <TabItem type="change" name={`${index}`} onchange={(name) => this.changeTab(name)} defaultActive={this.mode === `${index}`}>
              {item.name}
            </TabItem>
          ))}
          <TabItem type="button" onclick={() => this.addOutputSourceCodeOther()}>
            <span class="icon-[ic--baseline-library-add] text-2xl"></span>
          </TabItem>
        </TabPanel>
        <fieldset
          class={['flex h-[calc(100vh-260px)] flex-col gap-3 rounded-b-md border-x border-b border-zinc-500 p-3', this.mode !== Mode.MasterData && 'hidden']}
          ref={this.masterFieldset}
        >
          <OutputDataList outputData={outputProject.getMasterData()} dataNames={masterDataAccessor.getNames()} title="マスターデータJSON出力設定" outputTargetFlex={2} />
          <OutputDataList outputData={outputProject.getMasterList()} dataNames={masterListAccessor.getNames()} title="マスターリストJSON出力設定" outputTargetFlex={2} />
          <OutputDataList outputData={outputProject.getMasterConstants()} dataNames={masterConstantsAccessor.getNames()} title="定数データJSON出力設定" outputTargetFlex={1} />
        </fieldset>
        <OutputSourceCodeStandard outputProjectStandard={outputProject.getEntity()} mode={Mode.Entity} currentMode={this.mode} ref={this.entityOutputSourceCode} />
        <OutputSourceCodeStandard outputProjectStandard={outputProject.getSchema()} mode={Mode.Schema} currentMode={this.mode} ref={this.schemaOutputSourceCode} />
        <OutputSourceCodeStandard outputProjectStandard={outputProject.getEnumeration()} mode={Mode.Enumeration} currentMode={this.mode} ref={this.enumerationOutputSourceCode} />
        <OutputSourceCodeStandard outputProjectStandard={outputProject.getConstant()} mode={Mode.Constant} currentMode={this.mode} ref={this.constantOutputSourceCode} />
        {outputProject.getOthers().map((item, index) => (
          <OutputSourceCodeOther
            outputProjectOther={item}
            mode={`${index}`}
            currentMode={this.mode}
            removeOther={() => this.removeOutputSourceCodeOther(index)}
            ref={this.otherOutputSourceCodeList[index]}
          />
        ))}
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
    const { outputProject } = this.props
    const newIndex = outputProject.addOther()
    this.mode = `${newIndex}`
    this.render()
  }

  private removeOutputSourceCodeOther(index: number) {
    const { outputProject } = this.props
    outputProject.removeOther(index)
    this.mode = Mode.MasterData
    this.render()
  }
}
