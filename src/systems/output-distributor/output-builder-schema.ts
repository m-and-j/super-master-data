import { DataClassification, DataKindExtension } from '@/systems/define'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { preferences } from '@/systems/preferences'
import { OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * スキーマ出力クラス
 */
export class OutputBuilderSchema extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.schema.path)
    return new OutputBuilderSchema(outputPath, outputProject.codeExtension, outputProject.schema, outputProject.enumeration.fileNameTemplate)
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private schema: OutputProjectStandardRaw,
    private enumerationFileNameTemplate: string,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    const projectInfo = preferences.getProjectInfo()
    for (const item of projectInfo.schemas) {
      const columns = []
      const enumerationMap = new Map<string, object>()
      for (const column of item.columns) {
        const { name, label, description, type } = column
        const { typeName, extension, classification } = type
        const typeForLang = this.convertTypeName(type)
        columns.push({
          name,
          comment: `${label}${description ? ` (${description})` : ''}`,
          type: extension === DataKindExtension.Array ? `${typeForLang}[]` : typeForLang,
          typeClassification: classification,
          defaultValue: 'default!',
        })
        if (classification === DataClassification.Enumeration && !enumerationMap.has(typeName)) {
          enumerationMap.set(typeName, {
            name: typeName,
            filename: this.replaceFileName(this.enumerationFileNameTemplate, typeName),
          })
        }
      }
      const { name, description } = item
      const enumerations = Array.from(enumerationMap.values())
      const { fileNameTemplate } = this.schema
      this.writeSourceCode(this.schema.sourceCodeTemplate, { name, description, columns, enumerations }, { fileNameTemplate, name })
    }
  }
}
