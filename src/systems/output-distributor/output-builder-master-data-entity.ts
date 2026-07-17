import { DataClassification, DataKindExtension } from '@/systems/defines'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { OutputBuilderBase } from '@/systems/output-distributor/output-builder-base'
import { OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { path } from '@tauri-apps/api'

/**
 * エンティティ出力クラス
 */
export class OutputBuilderMasterDataEntity extends OutputBuilderBase {
  static async create(outputProject: OutputProjectRaw) {
    const folderPath = this.getFolderPath()
    const outputPath = await path.join(folderPath, outputProject.masterDataEntity.path)
    const { targets } = outputProject.masterData
    return new OutputBuilderMasterDataEntity(
      outputPath,
      outputProject.codeExtension,
      outputProject.masterDataEntity,
      targets,
      outputProject.schema.fileNameTemplate,
      outputProject.enumeration.fileNameTemplate,
    )
  }

  constructor(
    outputPath: string,
    codeExtension: string,
    private entity: OutputProjectStandardRaw,
    private targets: string[],
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
    const names = masterDataAccessor.getNames()
    for (const targetName of this.targets) {
      if (names.includes(targetName)) {
        const table = await masterDataAccessor.read(targetName)
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
  }
}
