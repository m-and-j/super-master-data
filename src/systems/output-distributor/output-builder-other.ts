import { OutputKind } from '@/systems/define'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { preferences } from '@/systems/preferences'
import { OutputProjectOtherRaw, OutputProjectRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * その他出力クラス
 */
export class OutputBuilderOther extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw, outputProjectOther: OutputProjectOtherRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProjectOther.path)
    return new OutputBuilderOther(outputPath, outputProject.codeExtension, outputProjectOther, outputProject.masterData.targets, outputProject.constantsData.targets)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private other: OutputProjectOtherRaw,
    private masterDataTargets: string[],
    private constantsDataTargets: string[],
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    if (this.other.kind === OutputKind.Single) {
      const names = masterDataAccessor.getNames()
      const projectInfo = preferences.getProjectInfo()
      const tables = []
      for (const targetName of this.masterDataTargets) {
        if (names.includes(targetName)) {
          const table = await masterDataAccessor.read(targetName)
          if (table) {
            tables.push({ name: table.name, description: table.description })
          }
        }
      }
      const constants = []
      for (const constantsGroup of projectInfo.constants) {
        if (this.constantsDataTargets.includes(constantsGroup.name)) {
          constants.push({ name: constantsGroup.name, description: constantsGroup.description })
        }
      }
      await this.writeSourceCode(this.other.sourceCodeTemplate, { tables, constants })
    } else {
      await this.removePreviousFiles()
      const names = masterDataAccessor.getNames()
      for (const targetName of this.masterDataTargets) {
        if (names.includes(targetName)) {
          const table = await masterDataAccessor.read(targetName)
          if (table) {
            const { fileNameTemplate = '' } = this.other
            const { name, description } = table
            await this.writeSourceCode(this.other.sourceCodeTemplate, { name, description }, { fileNameTemplate, name })
          }
        }
      }
    }
  }
}
