import { LocalStorageKeys } from '@/systems/define'
import masterData from '@/systems/master-data'
import { DataObject, DataObjectColumn, EnumerationItem, EnumerationObject, OutputItem, OutputProject, ProjectInfo } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { exists } from '@tauri-apps/plugin-fs'

class Preferences {
  private loadingPromise: Promise<boolean> | undefined
  private name: string = ''
  private description: string = ''
  private schemas: DataObject[] = []
  private enumerations: EnumerationObject[] = []
  private outputs: OutputProject[] = []
  private folderPath: string | undefined

  /**
   * 前回使用したファイルパスを localStorage から読み出し、存在すればそのファイルからプロジェクトを読み込む
   */
  async load() {
    if (!this.loadingPromise) {
      this.loadingPromise = new Promise<boolean>(async (resolve) => {
        const savedPath = localStorage.getItem(LocalStorageKeys.ProjectPath) ?? undefined
        let result = false
        if (savedPath) {
          try {
            const projectInfo = await readJsonFile<ProjectInfo>(this.toProjectFilePath(savedPath))
            this.name = projectInfo.name
            this.description = projectInfo.description
            this.schemas = projectInfo.schemas
            this.enumerations = projectInfo.enumerations
            this.outputs = projectInfo.outputs
            this.folderPath = savedPath
            await masterData.readFiles()
            result = true
          } catch (e) {
            console.error('前回のプロジェクトファイルの読み込みに失敗しました:', e)
            localStorage.removeItem(LocalStorageKeys.ProjectPath)
          }
        }
        resolve(result)
      })
    }
    return await this.loadingPromise
  }

  getProjectInfo(): ProjectInfo {
    return {
      name: this.name,
      description: this.description,
      schemas: this.schemas,
      enumerations: this.enumerations,
      outputs: this.outputs,
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
    localStorage.setItem(LocalStorageKeys.ProjectPath, path)
    const filePath = this.toProjectFilePath(path)
    if (await exists(filePath)) {
      const projectInfo = await readJsonFile<ProjectInfo>(filePath)
      this.name = projectInfo.name
      this.description = projectInfo.description
      this.schemas = projectInfo.schemas
      this.enumerations = projectInfo.enumerations
      this.outputs = projectInfo.outputs
      return false
    } else {
      await this.save()
      return true
    }
  }

  /**
   * プロジェクトのメタ情報(名前・説明)を更新して保存
   * @param name
   * @param description
   */
  async updateProjectMeta(name: string, description: string) {
    this.name = name
    this.description = description
    await this.save()
  }

  /**
   * スキーマ追加
   * @param name
   * @param description
   * @param columns
   */
  async addSchema(name: string, description: string, columns: DataObjectColumn[]) {
    if (this.schemas.some((s) => s.name === name)) {
      throw new Error('すでに同名のスキーマが存在します。')
    } else {
      this.schemas.push({ name, description, columns })
      this.schemas.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * スキーマ更新
   * @param name
   * @param description
   * @param columns
   */
  async updateSchema(name: string, description: string, columns: DataObjectColumn[]) {
    const schema = this.schemas.find((s) => s.name === name)
    if (schema) {
      schema.name = name
      schema.description = description
      schema.columns = columns
      await this.save()
    }
  }

  /**
   * スキーマ削除
   * @param name
   */
  async deleteSchema(name: string) {
    this.schemas = this.schemas.filter((s) => s.name !== name)
    await this.save()
  }

  /**
   * 列挙型追加
   * @param name
   * @param description
   * @param items
   */
  async addEnumeration(name: string, description: string, items: EnumerationItem[]) {
    if (this.enumerations.some((e) => e.name === name)) {
      throw new Error('すでに同名の列挙型が存在します。')
    } else {
      this.enumerations.push({ name, description, items })
      this.enumerations.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * 列挙型更新
   * @param name
   * @param description
   * @param items
   */
  async updateEnumeration(name: string, description: string, items: EnumerationItem[]) {
    const enumeration = this.enumerations.find((e) => e.name === name)
    if (enumeration) {
      enumeration.name = name
      enumeration.description = description
      enumeration.items = items
      await this.save()
    }
  }

  /**
   * 列挙型削除
   * @param name
   */
  async deleteEnumeration(name: string) {
    this.enumerations = this.enumerations.filter((e) => e.name !== name)
    await this.save()
  }

  /**
   * 出力設定追加
   * @param name
   * @param description
   * @param dataPath
   * @param codeExtension
   * @param entity
   * @param schema
   * @param enumeration
   */
  async addOutput(name: string, description: string, dataPath: string, codeExtension: string, entity: OutputItem, schema: OutputItem, enumeration: OutputItem) {
    if (this.outputs.some((e) => e.name === name)) {
      throw new Error('すでに同名の出力設定が存在します。')
    } else {
      this.outputs.push({ name, description, dataPath, codeExtension, entity, schema, enumeration })
      this.outputs.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * 出力設定更新
   * @param name
   * @param description
   * @param dataPath
   * @param codeExtension
   * @param entity
   * @param schema
   * @param enumeration
   */
  async updateOutput(name: string, description: string, dataPath: string, codeExtension: string, entity: OutputItem, schema: OutputItem, enumeration: OutputItem) {
    const output = this.outputs.find((e) => e.name === name)
    if (output) {
      output.name = name
      output.description = description
      output.dataPath = dataPath
      output.codeExtension = codeExtension
      output.entity = entity
      output.schema = schema
      output.enumeration = enumeration
      await this.save()
    }
  }

  /**
   * 出力設定削除
   * @param name
   */
  async deleteOutput(name: string) {
    this.outputs = this.outputs.filter((e) => e.name !== name)
    await this.save()
  }

  /**
   * リストを丸ごと置換する(JSON 直接編集用)
   */
  async replace({ schemas, enumerations, outputs }: { schemas?: DataObject[]; enumerations?: EnumerationObject[]; outputs?: OutputProject[] }) {
    if (schemas) {
      this.schemas = []
      for (const { name, description, columns } of schemas.sort((a, b) => a.name.localeCompare(b.name))) {
        this.schemas.push({ name, description, columns })
      }
    }
    if (enumerations) {
      this.enumerations = []
      for (const { name, description, items } of enumerations.sort((a, b) => a.name.localeCompare(b.name))) {
        this.enumerations.push({ name, description, items })
      }
    }
    if (outputs) {
      this.outputs = []
      for (const { name, description, dataPath, codeExtension, entity, schema, enumeration } of outputs.sort((a, b) => a.name.localeCompare(b.name))) {
        this.outputs.push({ name, description, dataPath, codeExtension, entity, schema, enumeration })
      }
    }
    await this.save()
  }

  private toProjectFilePath(folderPath: string) {
    return `${folderPath}/master-data-project.json`
  }

  private async save() {
    if (this.folderPath) {
      try {
        const projectInfo: ProjectInfo = {
          name: this.name,
          description: this.description,
          schemas: this.schemas,
          enumerations: this.enumerations,
          outputs: this.outputs,
        }
        await writeJsonFile(projectInfo, this.toProjectFilePath(this.folderPath))
      } catch (e) {
        console.error(e)
      }
    } else {
      console.warn('保存先が未設定のため保存できませんでした')
    }
  }
}

const preferences = new Preferences()
export default preferences
