import { ConstantKind } from '@/systems/define'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { preferences } from '@/systems/preferences'
import { ConstantRaw, OutputProjectRaw, OutputProjectStandardSingleRaw } from '@/systems/types'
import { escapeDoubleQuotes, escapeSingleQuotes } from '@/utilities/helper-text'
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
    private constant: OutputProjectStandardSingleRaw,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    const projectInfo = preferences.getProjectInfo()
    const constants = []
    for (const item of projectInfo.constants) {
      constants.push({
        name: item.name,
        upperName: item.name.toUpperCase(),
        label: item.label,
        type: item.type,
        value: this.toValue(item),
      })
    }
    await this.writeSourceCode(this.constant.sourceCodeTemplate, { constants })
  }

  private toValue({ value, type }: ConstantRaw) {
    switch (this.codeExtension) {
      case 'cs': {
        switch (type) {
          case ConstantKind.Int: {
            return `${value}`
          }
          case ConstantKind.Float: {
            return `${value}f`
          }
          case ConstantKind.String: {
            return `"${escapeDoubleQuotes(`${value}`)}"`
          }
          case ConstantKind.IntArray: {
            return `{ ${(value as number[]).join(', ')} }`
          }
          case ConstantKind.FloatArray: {
            return `{ ${(value as number[]).map((v) => `${v}f`).join(', ')} }`
          }
          case ConstantKind.StringArray: {
            return `{ ${(value as string[]).map((v) => `"${escapeDoubleQuotes(v)}"`).join(', ')} }`
          }
        }
      }
      case 'ts': {
        switch (type) {
          case ConstantKind.Int: {
            return `${value}`
          }
          case ConstantKind.Float: {
            return `${value}`
          }
          case ConstantKind.String: {
            return `'${escapeSingleQuotes(`${value}`)}'`
          }
          case ConstantKind.IntArray: {
            return `[${(value as number[]).join(', ')}]`
          }
          case ConstantKind.FloatArray: {
            return `[${(value as number[]).join(', ')}]`
          }
          case ConstantKind.StringArray: {
            return `[${(value as string[]).map((v) => `'${escapeDoubleQuotes(v)}'`).join(', ')}]`
          }
        }
      }
      default: {
        return JSON.stringify(value)
      }
    }
  }
}
