import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { DataClassification, OutputKind } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectOtherRaw } from '@/systems/types'

/**
 * その他出力クラス
 */
export class OutputBuilderOther extends OutputBuilderBase {
  static async create(outputProject: OutputProject, otherIndex: number) {
    const outputPath = await outputProject.getOtherPath(otherIndex)
    const raw = outputProject.toRaw()
    return new OutputBuilderOther(outputPath, raw.codeExtension, outputProject.getOther(otherIndex), raw.masterData.targets, raw.masterList.targets, raw.masterConstants.targets)
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
        const tables = []
        for (const table of masterDataAccessor.getAll()) {
          if (this.masterDataTargets.includes(table.name)) {
            tables.push({ name: table.name, description: table.description })
          }
        }
        const lists = []
        for (const list of masterListAccessor.getAll()) {
          if (this.masterListTargets.includes(list.name)) {
            lists.push({ name: list.name, description: list.description })
          }
        }
        const constants = []
        for (const constantsGroup of masterConstantsAccessor.getAll()) {
          if (this.constantsDataTargets.includes(constantsGroup.name)) {
            constants.push({ name: constantsGroup.name, description: constantsGroup.description })
          }
        }
        await this.writeSourceCode(this.other.sourceCodeTemplate, { tables, lists, constants })
        break
      }
      case OutputKind.MultipleTables: {
        await this.removePreviousFiles()
        for (const table of masterDataAccessor.getAll()) {
          if (this.masterDataTargets.includes(table.name)) {
            const { fileNameTemplate = '' } = this.other
            const { name, description, columns } = table
            const idColumn = columns.find((c) => c.type.classification === DataClassification.ID || c.type.classification === DataClassification.EnumerationID)
            const idName = idColumn?.name
            const idType = this.convertTypeName(idColumn?.type)
            const idClassification = idColumn?.type.classification
            const idTypeObjectFlag = this.isObject(idColumn?.type)
            await this.writeSourceCode(this.other.sourceCodeTemplate, { name, description, idName, idType, idClassification, idTypeObjectFlag }, { fileNameTemplate, name })
          }
        }
        break
      }
      case OutputKind.MultipleLists: {
        await this.removePreviousFiles()
        for (const list of masterListAccessor.getAll()) {
          if (this.masterListTargets.includes(list.name)) {
            const { fileNameTemplate = '' } = this.other
            const { name, description } = list
            await this.writeSourceCode(this.other.sourceCodeTemplate, { name, description }, { fileNameTemplate, name })
          }
        }
        break
      }
    }
  }
}
