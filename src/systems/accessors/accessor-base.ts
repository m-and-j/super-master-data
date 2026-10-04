import { LoadingMessage } from '@/components/notifications/LoadingMessage'
import { preferences } from '@/systems/preferences'
import { ConstantGroupRaw, DataStructRaw, EnumerationStructRaw, OutputProjectRaw, TableRaw } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { isSafeFilename } from '@/utilities/helper-text'
import { path } from '@tauri-apps/api'
import { exists, readDir, remove, rename } from '@tauri-apps/plugin-fs'

export const WriteFileState = {
  Writable: 'writable',
  Rename: 'rename',
  Duplicated: 'duplicated',
} as const

export abstract class AccessorBase<T extends ConstantGroupRaw | TableRaw | OutputProjectRaw | DataStructRaw | EnumerationStructRaw> {
  protected contents: T[] = []

  constructor(
    private tag = '',
    private projectFolder = '',
  ) {}

  async readFiles() {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      LoadingMessage.instance?.attach()
      const targetDir = await path.join(folderPath, this.projectFolder)
      const files = await readDir(targetDir)
      this.contents = []
      for (const file of files) {
        if (file.isFile && file.name.endsWith('.json')) {
          const name = file.name.replace('.json', '')
          const output = await this.read(name)
          if (output) {
            this.contents.push(output)
          }
        }
      }
      this.contents.sort((a, b) => a.name.localeCompare(b.name))
      LoadingMessage.instance?.detach()
    }
  }

  clear() {
    this.contents = []
  }

  getNames() {
    return this.contents.map((x) => x.name)
  }

  get(name: string): T | undefined
  get(index: number): T | undefined
  get(source: string | number): T | undefined {
    if (typeof source === 'number') {
      return this.contents[source]
    } else {
      return this.contents.find((x) => x.name === source)
    }
  }

  getAll() {
    return this.contents
  }

  findName(name: string) {
    return this.contents.find((x) => x.name === name)
  }

  filter(predicate: (value: T, index: number, array: T[]) => boolean) {
    return this.contents.filter(predicate)
  }

  map<T2>(callbackfn: (value: T, index: number, array: T[]) => T2) {
    return this.contents.map(callbackfn)
  }

  async write(source: T, oldName?: string) {
    if (!isSafeFilename(source.name) || (oldName && !isSafeFilename(oldName))) {
      throw new Error('不正なファイル名')
    }
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      const fileState = this.checkWriteFile(source.name, oldName)
      switch (fileState) {
        case WriteFileState.Rename: {
          try {
            const oldTarget = await path.join(folderPath, this.projectFolder, `${oldName}.json`)
            const newTarget = await path.join(folderPath, this.projectFolder, `${source.name}.json`)
            if (await exists(oldTarget)) {
              await rename(oldTarget, newTarget)
            }
          } catch (e) {
            console.error(`${this.tag}[${oldName}] → [${source.name}]のリネームに失敗:`, e)
            throw new Error(`[${oldName}]のリネームに失敗しました`)
          }
          break
        }
        case WriteFileState.Duplicated: {
          throw new Error(`「${source.name}」は既に存在しています。`)
        }
      }

      try {
        const target = await path.join(folderPath, this.projectFolder, `${source.name}.json`)
        await writeJsonFile<T>(source, target)
        await this.readFiles()
      } catch (e) {
        console.error(`${this.tag}[${source.name}]の書き込みに失敗:`, e)
        throw new Error(`[${source.name}]の書き込みに失敗しました`)
      }
    }
  }

  async remove(source: T) {
    const folderPath = preferences.getFolderPath()
    if (folderPath) {
      try {
        const target = await path.join(folderPath, this.projectFolder, `${source.name}.json`)
        if (await exists(target)) {
          await remove(target)
          await this.readFiles()
        }
      } catch (e) {
        console.error(`${this.tag}[${source.name}]の削除に失敗:`, e)
        throw new Error(`[${source.name}]の削除に失敗しました`)
      }
    }
  }

  private async read(name: string) {
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

  /**
   * 書き込み可能か判定
   * @param newName
   * @param oldName
   * @returns
   */
  private checkWriteFile(newName: string, oldName?: string) {
    if (oldName) {
      if (newName === oldName) {
        return WriteFileState.Writable
      } else if (this.contents.some((x) => x.name === newName)) {
        return WriteFileState.Duplicated
      } else {
        return WriteFileState.Rename
      }
    } else {
      return this.contents.some((x) => x.name === newName) ? WriteFileState.Duplicated : WriteFileState.Writable
    }
  }
}
