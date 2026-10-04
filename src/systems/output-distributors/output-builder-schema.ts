import { schemaAccessor } from '@/systems/accessors/schema-accessor'
import { DataClassification, DataKindExtension } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectStandardRaw } from '@/systems/types'

/**
 * スキーマ出力クラス
 */
export class OutputBuilderSchema extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getSchemaPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderSchema(outputPath, raw.codeExtension, raw.schema, raw.enumeration.fileNameTemplate)
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
    for (const schema of schemaAccessor.getAll()) {
      const columns = []
      const enumerationMap = new Map<string, object>()
      for (const column of schema.columns) {
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
      const { name, description } = schema
      const enumerations = Array.from(enumerationMap.values())
      const { fileNameTemplate } = this.schema
      await this.writeSourceCode(this.schema.sourceCodeTemplate, { name, description, columns, enumerations }, { fileNameTemplate, name })
    }
  }
}
