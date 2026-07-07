import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { preferences } from '@/systems/preferences'
import { OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * 列挙型出力クラス
 */
export class OutputBuilderEnumeration extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.enumeration.path)
    return new OutputBuilderEnumeration(outputPath, outputProject.codeExtension, outputProject.enumeration)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private enumeration: OutputProjectStandardRaw,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    const projectInfo = preferences.getProjectInfo()
    for (const item of projectInfo.enumerations) {
      const { fileNameTemplate } = this.enumeration
      const { name } = item
      await this.writeSourceCode(this.enumeration.sourceCodeTemplate, item, { fileNameTemplate, name })
    }
  }
}
