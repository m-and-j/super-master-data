import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProjectRaw } from '@/systems/types'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * マスターリスト出力クラス
 */
export class OutputBuilderMasterList extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.masterList.path)
    return new OutputBuilderMasterList(outputPath, 'json', outputProject.masterData.targets)
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
    const names = masterListAccessor.getNames()
    for (const targetName of this.targets) {
      if (names.includes(targetName)) {
        const table = await masterListAccessor.read(targetName)
        if (table) {
          // JSONデータ書き出し
          const dataFilePath = await path.join(this.outputPath, `${targetName}.json`)
          writeJsonFile(table.data, dataFilePath)
        }
      }
    }
  }
}
