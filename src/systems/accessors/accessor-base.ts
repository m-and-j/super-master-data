import { preferences } from '@/systems/preferences'
import { ConstantGroupRaw, TableRaw } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { path } from '@tauri-apps/api'
import { exists, readDir, remove, rename } from '@tauri-apps/plugin-fs'

export abstract class AccessorBase<T extends ConstantGroupRaw | TableRaw> {
  private names: string[] = []

  constructor(
    private tag = '',
    private projectFolder = '',
  ) {}

  async read(name: string) {
    const folderPath = preferences.getFolderPath()
    if (name && folderPath) {
      try {
        const target = await path.join(folderPath, this.projectFolder, `${name}.json`)
        return await readJsonFile<T>(target)
      } catch (e) {
        console.error(`${this.tag}[${name}]の読み込みに失敗:`, e)
      }
    }
    return undefined
  }

  async readFiles() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const targetDir = await path.join(folderPath, this.projectFolder)
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

  async write(source: T) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, this.projectFolder, `${source.name}.json`)
        await writeJsonFile<T>(source, target)
        await this.readFiles()
      } catch (e) {
        console.error(`${this.tag}[${source.name}]の書き込みに失敗:`, e)
      }
    }
  }

  async remove(name: string) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, this.projectFolder, `${name}.json`)
        if (await exists(target)) {
          await remove(target)
          await this.readFiles()
        }
      } catch (e) {
        console.error(`${this.tag}[${name}]の削除に失敗:`, e)
      }
    }
  }

  async rename(oldName: string, newName: string) {
    if (oldName !== newName) {
      const folderPath = preferences.getFolderPath()
      if (folderPath) {
        try {
          const oldTarget = await path.join(folderPath, this.projectFolder, `${oldName}.json`)
          const newTarget = await path.join(folderPath, this.projectFolder, `${newName}.json`)
          if (await exists(oldTarget)) {
            await rename(oldTarget, newTarget)
          }
        } catch (e) {
          console.error(`${this.tag}[${oldName}] → [${newName}]のリネームに失敗:`, e)
        }
      }
    }
  }
}
