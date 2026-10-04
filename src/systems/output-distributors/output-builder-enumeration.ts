import { enumerationAccessor } from '@/systems/accessors/enumeration-accessor'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectStandardRaw } from '@/systems/types'

/**
 * 列挙型出力クラス
 */
export class OutputBuilderEnumeration extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getEnumerationPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderEnumeration(outputPath, raw.codeExtension, raw.enumeration)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private enumerationOutput: OutputProjectStandardRaw,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    for (const enumeration of enumerationAccessor.getAll()) {
      const { fileNameTemplate, sourceCodeTemplate } = this.enumerationOutput
      const { name } = enumeration
      await this.writeSourceCode(sourceCodeTemplate, enumeration, { fileNameTemplate, name })
    }
  }
}
