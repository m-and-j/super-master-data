import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

/**
 * マスターリスト出力クラス
 */
export class OutputBuilderMasterList extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getMasterListPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderMasterList(outputPath, 'json', raw.masterList.targets)
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
    for (const list of masterListAccessor.getAll()) {
      if (this.targets.includes(list.name)) {
        const dataFilePath = await path.join(this.outputPath, `${list.name}.json`)
        await writeJsonFile(list.data, dataFilePath)
      }
    }
  }
}
