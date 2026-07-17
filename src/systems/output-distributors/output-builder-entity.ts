import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { DataClassification, DataKindExtension } from '@/systems/defines'
import { OutputBuilderBase } from '@/systems/output-distributors/output-builder-base'
import { OutputProjectRaw, OutputProjectStandardRaw, TableRaw } from '@/systems/types'
import { arrayUnique } from '@/utilities/helper-collection'
import { path } from '@tauri-apps/api'

/**
 * エンティティ出力クラス
 */
export class OutputBuilderEntity extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.entity.path)
    return new OutputBuilderEntity(
      outputPath,
      outputProject.codeExtension,
      outputProject.entity,
      outputProject.masterData.targets,
      outputProject.masterList.targets,
      outputProject.schema.fileNameTemplate,
      outputProject.enumeration.fileNameTemplate,
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
    const masterDataTargets = arrayUnique(masterDataAccessor.getNames(), this.masterDataTargets)
    for (const targetName of masterDataTargets) {
      const table = await masterDataAccessor.read(targetName)
      await this.writeTable(table)
    }
    const masterListTargets = arrayUnique(masterListAccessor.getNames(), this.masterListTargets)
    for (const targetName of masterListTargets) {
      const table = await masterListAccessor.read(targetName)
      await this.writeTable(table)
    }
  }

  private async writeTable(table?: TableRaw) {
    if (table) {
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
          case DataClassification.Enumeration: {
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
}
