import { ConstantKind, ConstantKindType } from '@/systems/defines'
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
          constants.push({
            name: item.name,
            label: item.label,
            type: this.convertConstantsType(item.type),
            array: /\[\]$/.test(item.type),
          })
        }
        const { fileNameTemplate } = this.constant
        const data = { name: constantsGroup.name, description: constantsGroup.description, constants }
        await this.writeSourceCode(this.constant.sourceCodeTemplate, data, { fileNameTemplate, name })
      }
    }
  }

  private convertConstantsType(type: ConstantKindType) {
    switch (this.codeExtension) {
      case 'ts':
        switch (type) {
          case ConstantKind.Int:
          case ConstantKind.Float: {
            return 'number'
          }
          case ConstantKind.IntArray:
          case ConstantKind.FloatArray: {
            return 'number[]'
          }
          case ConstantKind.String: {
            return 'string'
          }
          case ConstantKind.StringArray: {
            return 'string[]'
          }
        }
      case 'cs':
        switch (type) {
          case ConstantKind.Int:
          case ConstantKind.IntArray: {
            return 'int'
          }
          case ConstantKind.Float:
          case ConstantKind.FloatArray: {
            return 'float'
          }
          case ConstantKind.String:
          case ConstantKind.StringArray: {
            return 'string'
          }
        }
      default:
        return type
    }
  }
}
