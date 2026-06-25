import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { OutputProjectRaw } from '@/systems/types'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * マスターデータ出力クラス
 */
export class OutputBuilderMasterData extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.masterData.path)
    const { targets } = outputProject.masterData
    return new OutputBuilderMasterData(outputPath, 'json', targets)
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
    const names = masterDataAccessor.getNames()
    for (const targetName of this.targets) {
      if (names.includes(targetName)) {
        const table = await masterDataAccessor.read(targetName)
        if (table) {
          // JSONデータ書き出し
          const dataFilePath = await path.join(this.outputPath, `${targetName}.json`)
          writeJsonFile(table.data, dataFilePath)
        }
      }
    }
  }
}
