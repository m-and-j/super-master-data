import { ProjectFolder } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { ConstantGroupItemRaw, ConstantGroupRaw } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'
import { exists, readDir, remove, rename } from '@tauri-apps/plugin-fs'

class MasterConstantsAccessor {
  private names: string[] = []

  async read(name: string) {
    const folderPath = preferences.getFolderPath()
    if (name && folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Constants, `${name}.json`)
        return await readJsonFile<ConstantGroupRaw>(target)
      } catch (e) {
        console.error(`MasterConstants[${name}]の読み込みに失敗:`, e)
      }
    }
    return undefined
  }

  async readFiles() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const targetDir = await path.join(folderPath, ProjectFolder.Constants)
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

  async write(constantsGroup: ConstantGroupRaw) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Constants, `${constantsGroup.name}.json`)

        // JSONパラメータ整列のためのデータ再構築
        const items: ConstantGroupItemRaw[] = []
        for (const { name, label, type, value } of constantsGroup.items) {
          items.push({ name, label, type, value })
        }
        await writeJsonFile<ConstantGroupRaw>({ name: constantsGroup.name, description: constantsGroup.description, items }, target)
        await this.readFiles()
      } catch (e) {
        console.error(`MasterConstants[${constantsGroup.name}]の書き込みに失敗:`, e)
      }
    }
  }

  async remove(name: string) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, ProjectFolder.Constants, `${name}.json`)
        if (await exists(target)) {
          await remove(target)
          await this.readFiles()
        }
      } catch (e) {
        console.error(`MasterConstants[${name}]の削除に失敗:`, e)
      }
    }
  }

  async rename(oldName: string, newName: string) {
    if (oldName !== newName) {
      const folderPath = preferences.getFolderPath()
      if (folderPath) {
        try {
          const oldTarget = await path.join(folderPath, ProjectFolder.Constants, `${oldName}.json`)
          const newTarget = await path.join(folderPath, ProjectFolder.Constants, `${newName}.json`)
          if (await exists(oldTarget)) {
            await rename(oldTarget, newTarget)
          }
        } catch (e) {
          console.error(`MasterConstants[${oldName}] → [${newName}]のリネームに失敗:`, e)
        }
      }
    }
  }
}

export const masterConstantsAccessor = new MasterConstantsAccessor()
