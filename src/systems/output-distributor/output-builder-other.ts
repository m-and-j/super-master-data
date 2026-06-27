import { OutputKind } from '@/systems/define'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { OutputProjectOtherRaw, OutputProjectRaw } from '@/systems/types'
import { camelToKebabCase } from '@/utilities/helper-text'
import { path } from '@tauri-apps/api'
import pluralize from '@theothergothamdev/pluralize-ts'

/**
 * その他出力クラス
 */
export class OutputBuilderOther extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw, outputProjectOther: OutputProjectOtherRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProjectOther.path)
    const { targets } = outputProject.masterData
    return new OutputBuilderOther(outputPath, outputProject.codeExtension, outputProjectOther, targets)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private other: OutputProjectOtherRaw,
    private targets: string[],
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    if (this.other.kind === OutputKind.Single) {
      const tables = []
      const names = masterDataAccessor.getNames()
      for (const targetName of this.targets) {
        if (names.includes(targetName)) {
          const table = await masterDataAccessor.read(targetName)
          if (table) {
            const { name, description } = table
            const singularName = pluralize.singular(name)
            const kebabName = camelToKebabCase(name)
            tables.push({ name, singularName, kebabName, description })
          }
        }
      }
      await this.writeSourceCode(this.other.sourceCodeTemplate, { tables })
    } else {
      await this.removePreviousFiles()
      const names = masterDataAccessor.getNames()
      for (const targetName of this.targets) {
        if (names.includes(targetName)) {
          const table = await masterDataAccessor.read(targetName)
          if (table) {
            const { fileNameTemplate = '' } = this.other
            const { name, description } = table
            const singularName = pluralize.singular(name)
            await this.writeSourceCode(this.other.sourceCodeTemplate, { name, singularName, description }, { fileNameTemplate, name })
          }
        }
      }
    }
  }
}
