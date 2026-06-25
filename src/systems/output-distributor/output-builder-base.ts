import { DataClassification, DataKind } from '@/systems/define'
import { preferences } from '@/systems/preferences'
import { DataStructColumnTypeRaw } from '@/systems/types'
import { camelToKebabCase } from '@/utilities/helper-text'
import { path } from '@tauri-apps/api'
import { exists, mkdir, readDir, remove, writeFile } from '@tauri-apps/plugin-fs'
import pluralize from '@theothergothamdev/pluralize-ts'
import { Eta } from 'eta'

export abstract class OutputBuilderBase {
  protected static getFolderPath() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      return folderPath
    } else {
      throw new Error('プロジェクトフォルダが設定されていません')
    }
  }

  constructor(
    protected outputPath: string,
    protected codeExtension: string,
  ) {}

  abstract write(): Promise<void>

  /**
   * ソースコードを書き出す
   */
  protected async writeSourceCode(sourceCodeTemplate: string, data: object, options?: { fileNameTemplate: string; name: string }) {
    let filePath = this.outputPath
    if (options) {
      const { fileNameTemplate, name } = options
      const fileName = this.replaceFileName(fileNameTemplate, name)
      filePath = await path.join(this.outputPath, `${fileName}.${this.codeExtension}`)
    }
    const eta = new Eta({ autoTrim: false })
    const contents = eta.renderString(sourceCodeTemplate, data)
    const dataString = new TextEncoder().encode(contents)
    writeFile(filePath, dataString)
  }

  /**
   * 前回出力したファイルを削除する
   */
  protected async removePreviousFiles() {
    if (await exists(this.outputPath)) {
      const files = await readDir(this.outputPath)
      for (const file of files) {
        if (file.name.endsWith(`.${this.codeExtension}`)) {
          const deleteFile = await path.join(this.outputPath, file.name)
          await remove(deleteFile)
        }
      }
    } else {
      await mkdir(this.outputPath, { recursive: true })
    }
  }

  protected replaceFileName(fileNameTemplate: string, name: string) {
    return fileNameTemplate.replace('{{filename}}', name).replace('{{filenameSingular}}', pluralize.singular(name)).replace('{{filenameKebab}}', camelToKebabCase(name))
  }

  protected convertTypeName(columnType: DataStructColumnTypeRaw) {
    const { typeName, classification } = columnType
    switch (this.codeExtension) {
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
