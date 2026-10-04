import { enumerationAccessor } from '@/systems/accessors/enumeration-accessor'
import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { outputAccessor } from '@/systems/accessors/output-accessor'
import { schemaAccessor } from '@/systems/accessors/schema-accessor'
import { cacheStore } from '@/systems/cache-store'
import { ProjectFolder } from '@/systems/defines'
import { ProjectInfoRaw } from '@/systems/types'
import { promiseState, readJsonFile, writeJsonFile } from '@/utilities/helper'
import { exists, mkdir } from '@tauri-apps/plugin-fs'

class Preferences {
  private loadingPromise: Promise<void> | undefined
  private uuid: string = ''
  private name: string = ''
  private description: string = ''
  private folderPath: string | undefined

  /**
   * キャッシュに前回使用したファイルパスが存在すればそのファイルからプロジェクトを読み込む
   */
  async load() {
    const state = await promiseState(this.loadingPromise)
    if (!state || state === 'fulfilled') {
      this.loadingPromise = new Promise<void>(async (resolve, reject) => {
        const savedPath = cacheStore.projectPath.getValue()
        if (savedPath) {
          try {
            const projectInfo = await readJsonFile<ProjectInfoRaw>(this.toProjectFilePath(savedPath))
            this.uuid = projectInfo.uuid
            this.name = projectInfo.name
            this.description = projectInfo.description
            this.folderPath = savedPath
            await masterDataAccessor.readFiles()
            await masterListAccessor.readFiles()
            await masterConstantsAccessor.readFiles()
            await enumerationAccessor.readFiles()
            await schemaAccessor.readFiles()
            await outputAccessor.readFiles()
          } catch (e) {
            cacheStore.projectPath.remove()
            this.uuid = ''
            this.name = ''
            this.description = ''
            this.folderPath = undefined
            masterDataAccessor.clear()
            masterListAccessor.clear()
            masterConstantsAccessor.clear()
            enumerationAccessor.clear()
            schemaAccessor.clear()
            outputAccessor.clear()
            reject(e)
          }
        }
        resolve()
        this.loadingPromise = undefined
      })
    }
    return await this.loadingPromise
  }

  getProjectInfo(): ProjectInfoRaw {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
    }
  }

  /**
   * 現在の保存先フォルダパス(未設定なら undefined)
   */
  getFolderPath() {
    return this.folderPath
  }

  existsProject() {
    return Boolean(this.folderPath)
  }

  /**
   * 既存のプロジェクトファイルを開く
   * @param path
   * @returns 新規作成時はTrue
   */
  async openProject(path: string) {
    this.folderPath = path
    cacheStore.projectPath.setValue(path)
    const filePath = this.toProjectFilePath(path)
    if (await exists(filePath)) {
      await this.load()
      return false
    } else {
      this.uuid = crypto.randomUUID()
      this.name = '新規プロジェクト'
      this.description = ''
      await this.save()
      await mkdir(`${path}/${ProjectFolder.Constants}`)
      await mkdir(`${path}/${ProjectFolder.Enumerations}`)
      await mkdir(`${path}/${ProjectFolder.Lists}`)
      await mkdir(`${path}/${ProjectFolder.Outputs}`)
      await mkdir(`${path}/${ProjectFolder.Schemas}`)
      await mkdir(`${path}/${ProjectFolder.Tables}`)
      masterDataAccessor.clear()
      masterListAccessor.clear()
      masterConstantsAccessor.clear()
      enumerationAccessor.clear()
      schemaAccessor.clear()
      outputAccessor.clear()
      return true
    }
  }

  /**
   * プロジェクトの情報(名前・説明)を更新して保存
   * @param name
   * @param description
   */
  async updateProjectMeta(name: string, description: string) {
    this.name = name
    this.description = description
    await this.save()
  }

  private toProjectFilePath(folderPath: string) {
    return `${folderPath}/master-data-project.json`
  }

  private async save() {
    if (this.folderPath) {
      try {
        await writeJsonFile<ProjectInfoRaw>(
          {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
          },
          this.toProjectFilePath(this.folderPath),
        )
      } catch (e) {
        console.error(e)
      }
    } else {
      console.warn('保存先が未設定のため保存できませんでした')
    }
  }
}

export const preferences = new Preferences()
