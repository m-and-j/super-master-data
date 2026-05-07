import { ProjectFolder } from '@/systems/define'
import preferences from '@/systems/preferences'
import { Table } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'
import { exists, readDir, remove, rename } from '@tauri-apps/plugin-fs'

class MasterData {
  private names: string[] = []

  async read(name?: string) {
    const folderPath = preferences.getFolderPath()
    if (name && folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Tables, `${name}.json`)
        return await readJsonFile<Table>(target)
      } catch (e) {
        console.error(`MasterData[${name}]の読み込みに失敗:`, e)
      }
    }
    return undefined
  }

  async readFiles() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const targetDir = await path.join(folderPath, ProjectFolder.Tables)
      const files = await readDir(targetDir)
      for (const file of files) {
        if (file.isFile && file.name.endsWith('.json')) {
          this.names.push(file.name.replace('.json', ''))
        }
      }
    }
  }

  getNames() {
    return this.names
  }

  async write(table: Table) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Tables, `${table.name}.json`)
        await writeJsonFile(table, target)
      } catch (e) {
        console.error(`MasterData[${table.name}]の書き込みに失敗:`, e)
      }
    }
  }

  async remove(name: string) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Tables, `${name}.json`)
        if (await exists(target)) {
          await remove(target)
        }
      } catch (e) {
        console.error(`MasterData[${name}]の削除に失敗:`, e)
      }
    }
  }

  async rename(oldName: string, newName: string) {
    if (oldName !== newName) {
      const folderPath = preferences.getFolderPath()
      if (folderPath) {
        try {
          const oldTarget = await path.join(folderPath, ProjectFolder.Tables, `${oldName}.json`)
          const newTarget = await path.join(folderPath, ProjectFolder.Tables, `${newName}.json`)
          if (await exists(oldTarget)) {
            await rename(oldTarget, newTarget)
          }
        } catch (e) {
          console.error(`MasterData[${oldName}] → [${newName}]のリネームに失敗:`, e)
        }
      }
    }
  }
}

const masterData = new MasterData()
export default masterData
