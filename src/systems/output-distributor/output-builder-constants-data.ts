import { masterConstantsAccessor } from '@/systems/master-constants-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { OutputProjectRaw } from '@/systems/types'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * 定数データ出力クラス
 */
export class OutputBuilderConstantsData extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.constantsData.path)
    const { targets } = outputProject.constantsData
    return new OutputBuilderConstantsData(outputPath, 'json', targets)
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
    for (const name of masterConstantsAccessor.getNames()) {
      const constantsGroup = await masterConstantsAccessor.read(name)
      if (constantsGroup && this.targets.includes(constantsGroup.name)) {
        // JSONデータ書き出し
        const dataFilePath = await path.join(this.outputPath, `${constantsGroup.name}.json`)
        const items = []
        for (const item of constantsGroup.items) {
          items.push({
            name: item.name,
            value: item.value,
          })
        }
        writeJsonFile(items, dataFilePath)
      }
    }
  }
}
