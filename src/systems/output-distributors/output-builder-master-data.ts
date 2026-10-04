import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * マスターデータ出力クラス
 */
export class OutputBuilderMasterData extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getMasterDataPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderMasterData(outputPath, 'json', raw.masterData.targets)
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
    for (const table of masterDataAccessor.getAll()) {
      if (this.targets.includes(table.name)) {
        const dataFilePath = await path.join(this.outputPath, `${table.name}.json`)
        await writeJsonFile(table.data, dataFilePath)
      }
    }
  }
}
