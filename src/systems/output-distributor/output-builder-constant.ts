import { masterConstantsAccessor } from '@/systems/master-constants-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * 定数出力クラス
 */
export class OutputBuilderConstant extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.constant.path)
    return new OutputBuilderConstant(outputPath, outputProject.codeExtension, outputProject.constant)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private constant: OutputProjectStandardRaw,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    for (const name of masterConstantsAccessor.getNames()) {
      const constantsGroup = await masterConstantsAccessor.read(name)
      if (constantsGroup) {
        const constants = []
        for (const item of constantsGroup.items) {
          const singleType = item.type.replace('[]', '')
          constants.push({
            name: item.name,
            label: item.label,
            type: item.type,
            singleType,
            array: /\[\]$/.test(item.type),
          })
        }
        const { fileNameTemplate } = this.constant
        const data = { name: constantsGroup.name, description: constantsGroup.description, constants }
        await this.writeSourceCode(this.constant.sourceCodeTemplate, data, { fileNameTemplate, name })
      }
    }
  }
}
