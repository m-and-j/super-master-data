import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { OutputKind } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProjectOtherRaw, OutputProjectRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * その他出力クラス
 */
export class OutputBuilderOther extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw, outputProjectOther: OutputProjectOtherRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProjectOther.path)
    return new OutputBuilderOther(
      outputPath,
      outputProject.codeExtension,
      outputProjectOther,
      outputProject.masterData.targets,
      outputProject.masterList.targets,
      outputProject.masterConstants.targets,
    )
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private other: OutputProjectOtherRaw,
    private masterDataTargets: string[],
    private masterListTargets: string[],
    private constantsDataTargets: string[],
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    switch (this.other.kind) {
      case OutputKind.Single: {
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
        const listNames = masterListAccessor.getNames()
        const lists = []
        for (const targetName of this.masterListTargets) {
          if (listNames.includes(targetName)) {
            const list = await masterListAccessor.read(targetName)
            if (list) {
              lists.push({ name: list.name, description: list.description })
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
        await this.writeSourceCode(this.other.sourceCodeTemplate, { tables, lists, constants })
        break
      }
      case OutputKind.MultipleTables: {
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
        break
      }
      case OutputKind.MultipleLists: {
        await this.removePreviousFiles()
        const names = masterListAccessor.getNames()
        for (const targetName of this.masterListTargets) {
          if (names.includes(targetName)) {
            const list = await masterListAccessor.read(targetName)
            if (list) {
              const { fileNameTemplate = '' } = this.other
              const { name, description } = list
              await this.writeSourceCode(this.other.sourceCodeTemplate, { name, description }, { fileNameTemplate, name })
            }
          }
        }
        break
      }
    }
  }
}
