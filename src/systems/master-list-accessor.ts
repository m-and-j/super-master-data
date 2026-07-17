import { DataClassification, DataKind, DataKindExtension, ProjectFolder } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { DataStructColumnRaw, MasterRecord, TableRaw } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'
import { exists, readDir, remove, rename } from '@tauri-apps/plugin-fs'

class MasterListAccessor {
  private names: string[] = []

  async read(name: string) {
    const folderPath = preferences.getFolderPath()
    if (name && folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Lists, `${name}.json`)
        return await readJsonFile<TableRaw>(target)
      } catch (e) {
        console.error(`MasterList[${name}]の読み込みに失敗:`, e)
      }
    }
    return undefined
  }

  async readFiles() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const targetDir = await path.join(folderPath, ProjectFolder.Lists)
      const files = await readDir(targetDir)
      this.names = []
      for (const file of files) {
        if (file.isFile && file.name.endsWith('.json')) {
          this.names.push(file.name.replace('.json', ''))
        }
      }
      this.names.sort()
    }
  }

  getNames() {
    return this.names
  }

  async write(table: TableRaw) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Lists, `${table.name}.json`)

        // JSONパラメータ整列のためのデータ再構築
        const columns: DataStructColumnRaw[] = []
        for (const { name, label, type, description } of table.columns) {
          const { classification, typeName, extension } = type
          columns.push({ name, label, type: { classification, typeName, extension }, description })
        }
        const data = []
        for (const row of table.data) {
          const value: MasterRecord = {}
          for (const newColumn of columns) {
            const oldColumn = table.columns.find((c) => c.name === newColumn.name)
            if (
              oldColumn &&
              newColumn.type.classification === oldColumn.type.classification &&
              newColumn.type.typeName === oldColumn.type.typeName &&
              newColumn.type.extension === oldColumn.type.extension
            ) {
              value[newColumn.name] = row[oldColumn.name]
            } else {
              switch (newColumn.type.extension) {
                case DataKindExtension.Array: {
                  value[newColumn.name] = []
                  break
                }
                case DataKindExtension.Optional: {
                  value[newColumn.name] = null
                  break
                }
                default: {
                  if (newColumn.type.classification === DataClassification.Enumeration) {
                    value[newColumn.name] = 0
                  } else {
                    switch (newColumn.type.typeName) {
                      case DataKind.Bool: {
                        value[newColumn.name] = false
                        break
                      }
                      case DataKind.Date:
                      case DataKind.Datetime:
                      case DataKind.Time:
                      case DataKind.String: {
                        value[newColumn.name] = ''
                        break
                      }
                      case DataKind.Int:
                      case DataKind.Float:
                      case DataKind.Double: {
                        value[newColumn.name] = 0
                        break
                      }
                      default: {
                        value[newColumn.name] = null
                        break
                      }
                    }
                  }
                  break
                }
              }
            }
          }
          data.push(value)
        }
        await writeJsonFile<TableRaw>({ name: table.name, description: table.description, columns, data }, target)
        await this.readFiles()
      } catch (e) {
        console.error(`MasterList[${table.name}]の書き込みに失敗:`, e)
      }
    }
  }

  async remove(name: string) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Lists, `${name}.json`)
        if (await exists(target)) {
          await remove(target)
          await this.readFiles()
        }
      } catch (e) {
        console.error(`MasterList[${name}]の削除に失敗:`, e)
      }
    }
  }

  async rename(oldName: string, newName: string) {
    if (oldName !== newName) {
      const folderPath = preferences.getFolderPath()
      if (folderPath) {
        try {
          const oldTarget = await path.join(folderPath, ProjectFolder.Lists, `${oldName}.json`)
          const newTarget = await path.join(folderPath, ProjectFolder.Lists, `${newName}.json`)
          if (await exists(oldTarget)) {
            await rename(oldTarget, newTarget)
          }
        } catch (e) {
          console.error(`MasterList[${oldName}] → [${newName}]のリネームに失敗:`, e)
        }
      }
    }
  }
}

export const masterListAccessor = new MasterListAccessor()
