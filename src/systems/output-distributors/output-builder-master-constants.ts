import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * 定数データ出力クラス
 */
export class OutputBuilderMasterConstants extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getMasterConstantsPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderMasterConstants(outputPath, 'json', raw.masterConstants.targets)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private targets: string[],
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * JSONデータ書き出し
   */
  async write() {
    await this.removePreviousFiles()
    for (const constantsGroup of masterConstantsAccessor.getAll()) {
      if (this.targets.includes(constantsGroup.name)) {
        const dataFilePath = await path.join(this.outputPath, `${constantsGroup.name}.json`)
        const items = []
        for (const item of constantsGroup.items) {
          items.push({
            name: item.name,
            value: item.value,
          })
        }
        await writeJsonFile(items, dataFilePath)
      }
    }
  }
}
