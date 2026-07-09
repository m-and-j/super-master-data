import { OutputKind } from '@/systems/define'
import { masterConstantsAccessor } from '@/systems/master-constants-accessor'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
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
      const tableNames = masterDataAccessor.getNames()
      const tables = []
      for (const targetName of this.masterDataTargets) {
        if (tableNames.includes(targetName)) {
          const table = await masterDataAccessor.read(targetName)
          if (table) {
            tables.push({ name: table.name, description: table.description })
          }
        }
      }
      const constantsGroupNames = masterConstantsAccessor.getNames()
      const constants = []
      for (const targetName of this.constantsDataTargets) {
        if (constantsGroupNames.includes(targetName)) {
          const constantsGroup = await masterConstantsAccessor.read(targetName)
          if (constantsGroup) {
            constants.push({ name: constantsGroup.name, description: constantsGroup.description })
          }
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
