import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { DataClassification, DataKindExtension } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProject } from '@/systems/output-distributors/output-project'
import { OutputProjectStandardRaw, TableRaw } from '@/systems/types'

/**
 * エンティティ出力クラス
 */
export class OutputBuilderEntity extends OutputBuilderBase {
  static async create(outputProject: OutputProject) {
    const outputPath = await outputProject.getEntityPath()
    const raw = outputProject.toRaw()
    return new OutputBuilderEntity(
      outputPath,
      raw.codeExtension,
      raw.entity,
      raw.masterData.targets,
      raw.masterList.targets,
      raw.schema.fileNameTemplate,
      raw.enumeration.fileNameTemplate,
    )
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private entity: OutputProjectStandardRaw,
    private masterDataTargets: string[],
    private masterListTargets: string[],
    private schemaFileNameTemplate: string,
    private enumerationFileNameTemplate: string,
  ) {
    super(outputPath, codeExtension)
  }

  /**
   * ソースコード書き出し
   */
  async write() {
    await this.removePreviousFiles()
    for (const table of masterDataAccessor.getAll()) {
      if (this.masterDataTargets.includes(table.name)) {
        await this.writeTable(table)
      }
    }
    for (const list of masterListAccessor.getAll()) {
      if (this.masterListTargets.includes(list.name)) {
        await this.writeTable(list)
      }
    }
  }

  private async writeTable(table: TableRaw) {
    const columns = []
    const enumerationMap = new Map<string, object>()
    const schemaMap = new Map<string, object>()
    for (const column of table.columns) {
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
      switch (classification) {
        case DataClassification.Enumeration:
        case DataClassification.EnumerationID: {
          if (!enumerationMap.has(typeName)) {
            enumerationMap.set(typeName, {
              name: typeName,
              filename: this.replaceFileName(this.enumerationFileNameTemplate, typeName),
            })
          }
          break
        }
        case DataClassification.Schema: {
          if (!schemaMap.has(typeName)) {
            schemaMap.set(typeName, {
              name: typeName,
              filename: this.replaceFileName(this.schemaFileNameTemplate, typeName),
            })
          }
          break
        }
      }
    }
    const { name, description } = table
    const enumerations = Array.from(enumerationMap.values())
    const schemas = Array.from(schemaMap.values())
    const { fileNameTemplate } = this.entity
    await this.writeSourceCode(this.entity.sourceCodeTemplate, { name, description, columns, enumerations, schemas }, { fileNameTemplate, name })
  }
}
