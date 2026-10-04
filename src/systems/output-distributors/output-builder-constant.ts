import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { ConstantKind, ConstantKindType } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectStandardRaw } from '@/systems/types'

/**
 * 定数出力クラス
 */
export class OutputBuilderConstant extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getConstantPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderConstant(outputPath, raw.codeExtension, raw.constant, raw.masterConstants.targets)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private constant: OutputProjectStandardRaw,
    private targets: string[],
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    for (const constantsGroup of masterConstantsAccessor.getAll()) {
      if (this.targets.includes(constantsGroup.name)) {
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
        await this.writeSourceCode(this.constant.sourceCodeTemplate, data, { fileNameTemplate, name: constantsGroup.name })
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
