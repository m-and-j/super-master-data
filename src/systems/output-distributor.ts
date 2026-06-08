import { DataClassification, DataKind, DataKindExtension } from '@/systems/define'
import { masterData } from '@/systems/master-data'
import { preferences } from '@/systems/preferences'
import { DataObjectColumnType, OutputItem, OutputProject } from '@/systems/types'
import { writeJsonFile } from '@/utilities/helper'
import { camelToKebabCase } from '@/utilities/helper-text'
import { path } from '@tauri-apps/api'
import { exists, mkdir, readDir, remove, writeFile } from '@tauri-apps/plugin-fs'
import pluralize from '@theothergothamdev/pluralize-ts'
import { Eta } from 'eta'

export class OutputDistributor {
  constructor(private outputProject: OutputProject) {}

  async exec() {
    const { dataDir, entityDir, schemaDir, enumerationDir } = await this.getPaths()
    const { targetMasterData, codeExtension, entity, schema, enumeration } = this.outputProject
    await this.removePreviousFiles(dataDir, 'json')
    await this.removePreviousFiles(entityDir, codeExtension)
    await this.removePreviousFiles(schemaDir, codeExtension)
    await this.removePreviousFiles(enumerationDir, codeExtension)

    // EntityとJSONデータ書き出し
    const names = masterData.getNames()
    for (const targetName of targetMasterData) {
      if (names.includes(targetName)) {
        const table = await masterData.read(targetName)
        if (table) {
          // JSONデータ書き出し
          const dataFilePath = await path.join(dataDir, `${targetName}.json`)
          writeJsonFile(table.data, dataFilePath)

          // Entity書き出し
          const columns = []
          const enumerationMap = new Map<string, object>()
          const schemaMap = new Map<string, object>()
          for (const column of table.columns) {
            const { name, label, description, type } = column
            const { typeName, extension, classification } = type
            const typeForLang = this.convertTypeName(type, codeExtension)
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
                    filename: this.replaceFileName(enumeration.fileNameTemplate, typeName),
                  })
                }
                break
              }
              case DataClassification.Schema: {
                if (!schemaMap.has(typeName)) {
                  schemaMap.set(typeName, {
                    name: typeName,
                    filename: this.replaceFileName(schema.fileNameTemplate, typeName),
                  })
                }
                break
              }
            }
          }
          const { name, description } = table
          const singularName = pluralize.singular(name)
          const enumerations = Array.from(enumerationMap.values())
          const schemas = Array.from(schemaMap.values())
          this.writeSourceCode(entity, entityDir, targetName, { name, singularName, description, columns, enumerations, schemas })
        }
      }
    }

    const projectInfo = await preferences.getProjectInfo()

    // スキーマ書き出し
    for (const item of projectInfo.schemas) {
      // Schema書き出し
      const columns = []
      const enumerationMap = new Map<string, object>()
      for (const column of item.columns) {
        const { name, label, description, type } = column
        const { typeName, extension, classification } = type
        const typeForLang = this.convertTypeName(type, codeExtension)
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
            filename: this.replaceFileName(enumeration.fileNameTemplate, typeName),
          })
        }
      }
      const { name, description } = item
      const enumerations = Array.from(enumerationMap.values())
      this.writeSourceCode(schema, schemaDir, item.name, { name, description, columns, enumerations })
    }

    // 列挙型書き出し
    for (const item of projectInfo.enumerations) {
      // Enumeration書き出し
      this.writeSourceCode(enumeration, enumerationDir, item.name, item)
    }
  }

  /**
   * 各出力先のパスを取得
   */
  private async getPaths() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const { dataPath, entity, schema, enumeration } = this.outputProject
      const dataDir = await path.join(folderPath, dataPath)
      const entityDir = await path.join(folderPath, entity.path)
      const schemaDir = await path.join(folderPath, schema.path)
      const enumerationDir = await path.join(folderPath, enumeration.path)
      return { dataDir, entityDir, schemaDir, enumerationDir }
    } else {
      throw new Error('プロジェクトフォルダが設定されていません')
    }
  }

  /**
   * ソースコードを書き出す
   */
  private async writeSourceCode(outputItem: OutputItem, dirPath: string, name: string, data: object) {
    const fileName = this.replaceFileName(outputItem.fileNameTemplate, name)
    const filePath = await path.join(dirPath, `${fileName}.${this.outputProject.codeExtension}`)
    const eta = new Eta({ autoTrim: false })
    const contents = eta.renderString(outputItem.sourceCodeTemplate, data)
    const dataString = new TextEncoder().encode(contents)
    writeFile(filePath, dataString)
  }

  /**
   * 前回出力したファイルを削除する
   * @param targetDir
   * @param codeExtension
   */
  private async removePreviousFiles(targetDir: string, codeExtension: string) {
    if (await exists(targetDir)) {
      const files = await readDir(targetDir)
      for (const file of files) {
        if (file.name.endsWith(`.${codeExtension}`)) {
          const deleteFile = await path.join(targetDir, file.name)
          await remove(deleteFile)
        }
      }
    } else {
      await mkdir(targetDir, { recursive: true })
    }
  }

  private replaceFileName(fileNameTemplate: string, name: string) {
    return fileNameTemplate.replace('{{filename}}', name).replace('{{filenameSingular}}', pluralize.singular(name)).replace('{{filenameKebab}}', camelToKebabCase(name))
  }

  private convertTypeName(columnType: DataObjectColumnType, language: string) {
    const { typeName, classification } = columnType
    switch (language) {
      case 'ts':
        switch (typeName) {
          case DataKind.Int:
          case DataKind.Float:
          case DataKind.Double: {
            return 'number'
          }
          case DataKind.String:
          case DataKind.Datetime:
          case DataKind.Date:
          case DataKind.Time: {
            return 'string'
          }
          case DataKind.Bool: {
            return 'boolean'
          }
          default: {
            return classification === DataClassification.RelationID ? 'string' : typeName
          }
        }
      case 'cs':
        switch (typeName) {
          case DataKind.Date:
          case DataKind.Datetime: {
            //return 'System.DateTime'
            return 'string'
          }
          case DataKind.Time: {
            //return 'System.TimeSpan'
            return 'string'
          }
          default: {
            return classification === DataClassification.RelationID ? 'string' : typeName
          }
        }
      default:
        return typeName
    }
  }
}
