import { OutputForm } from '@/components/inputs/OutputForm'
import { SideMenuOutput } from '@/components/wayFinders/SideMenuOutput'
import { preferences } from '@/systems/preferences'
import { MJPage } from '@mj/router'

export class Outputs extends MJPage {
  createNode() {
    const { name } = this.params
    const projectInfo = preferences.getProjectInfo()
    const targetOutput = projectInfo.outputs.find((s) => s.name === name)
    return (
      <div class="flex h-[calc(100vh-52px)] items-stretch text-sm">
        {/** 左メニュー */}
        <SideMenuOutput currentName={name} />

        {/** コンテンツ */}
        <OutputForm targetOutput={targetOutput} />
      </div>
    )
  }
}
