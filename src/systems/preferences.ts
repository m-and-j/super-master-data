import { cacheStore } from '@/systems/cache-store'
import { masterConstantsAccessor } from '@/systems/master-constants-accessor'
import { masterDataAccessor } from '@/systems/master-data-accessor'
import { DataStructRaw, EnumerationStructRaw, OutputProjectRaw, ProjectInfoRaw } from '@/systems/types'
import { readJsonFile, writeJsonFile } from '@/utilities/helper'
import { exists } from '@tauri-apps/plugin-fs'

class Preferences {
  private loadingPromise: Promise<boolean> | undefined
  private name: string = ''
  private description: string = ''
  private schemas: DataStructRaw[] = []
  private enumerations: EnumerationStructRaw[] = []
  private outputs: OutputProjectRaw[] = []
  private folderPath: string | undefined

  /**
   * キャッシュに前回使用したファイルパスが存在すればそのファイルからプロジェクトを読み込む
   */
  async load() {
    if (!this.loadingPromise) {
      this.loadingPromise = new Promise<boolean>(async (resolve) => {
        const savedPath = cacheStore.projectPath.getValue()
        let result = false
        if (savedPath) {
          try {
            const projectInfo = await readJsonFile<ProjectInfoRaw>(this.toProjectFilePath(savedPath))
            this.name = projectInfo.name
            this.description = projectInfo.description
            this.schemas = projectInfo.schemas
            this.enumerations = projectInfo.enumerations
            this.outputs = projectInfo.outputs
            this.folderPath = savedPath
            await masterDataAccessor.readFiles()
            await masterConstantsAccessor.readFiles()
            result = true
          } catch (e) {
            console.error('前回のプロジェクトファイルの読み込みに失敗しました:', e)
            cacheStore.projectPath.remove()
          }
        }
        resolve(result)
      })
    }
    return await this.loadingPromise
  }

  getProjectInfo(): ProjectInfoRaw {
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
    cacheStore.projectPath.setValue(path)
    const filePath = this.toProjectFilePath(path)
    if (await exists(filePath)) {
      const projectInfo = await readJsonFile<ProjectInfoRaw>(filePath)
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
   * プロジェクトの情報(名前・説明)を更新して保存
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
   * @param schema
   */
  async addSchema(schema: DataStructRaw) {
    if (this.schemas.some((s) => s.name === schema.name)) {
      throw new Error('すでに同名のスキーマが存在します。')
    } else {
      const { name, description, columns } = schema
      this.schemas.push({ name, description, columns })
      this.schemas.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * スキーマ更新
   * @param beforeName
   * @param newSchema
   */
  async updateSchema(beforeName: string, newSchema: DataStructRaw) {
    const schema = this.schemas.find((s) => s.name === beforeName)
    if (schema) {
      const { name, description, columns } = newSchema
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
   * @param enumeration
   */
  async addEnumeration(enumeration: EnumerationStructRaw) {
    if (this.enumerations.some((e) => e.name === enumeration.name)) {
      throw new Error('すでに同名の列挙型が存在します。')
    } else {
      const { name, description, items } = enumeration
      items.sort((a, b) => a.value - b.value)
      this.enumerations.push({ name, description, items })
      this.enumerations.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * 列挙型更新
   * @param beforeName
   * @param newEnumeration
   */
  async updateEnumeration(beforeName: string, newEnumeration: EnumerationStructRaw) {
    const enumeration = this.enumerations.find((e) => e.name === beforeName)
    if (enumeration) {
      enumeration.name = newEnumeration.name
      enumeration.description = newEnumeration.description
      enumeration.items = newEnumeration.items.sort((a, b) => a.value - b.value)
      this.enumerations.sort((a, b) => a.name.localeCompare(b.name))
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
   * @param outputProject
   */
  async addOutput(outputProject: OutputProjectRaw) {
    if (this.outputs.some((e) => e.name === outputProject.name)) {
      throw new Error('すでに同名の出力設定が存在します。')
    } else {
      const { name, description, codeExtension, masterData, constantsData, entity, schema, enumeration, constant, others } = outputProject
      this.outputs.push({ name, description, codeExtension, masterData, constantsData, entity, schema, enumeration, constant, others })
      this.outputs.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
    }
  }

  /**
   * 出力設定更新
   * @param outputProject
   */
  async updateOutput(outputProject: OutputProjectRaw) {
    const output = this.outputs.find((e) => e.name === outputProject.name)
    if (output) {
      output.name = outputProject.name
      output.description = outputProject.description
      output.codeExtension = outputProject.codeExtension
      output.masterData = outputProject.masterData
      output.constantsData = outputProject.constantsData
      output.entity = outputProject.entity
      output.schema = outputProject.schema
      output.enumeration = outputProject.enumeration
      output.constant = outputProject.constant
      output.others = outputProject.others
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
   * 対象のテーブル名を変更
   * @param oldTableName
   * @param newTableName
   */
  async changeTableName(oldTableName: string, newTableName: string) {
    if (oldTableName !== newTableName) {
      for (const output of this.outputs) {
        const index = output.masterData.targets.indexOf(oldTableName)
        if (index >= 0) {
          output.masterData.targets.splice(index, 1, newTableName)
          output.masterData.targets.sort()
        }
      }
      await this.save()
    }
  }

  /**
   * 対象のテーブルを削除
   * @param tableName
   */
  async deleteTableName(tableName: string) {
    for (const output of this.outputs) {
      const index = output.masterData.targets.indexOf(tableName)
      if (index >= 0) {
        output.masterData.targets.splice(index, 1)
      }
    }
    await this.save()
  }

  /**
   * 対象の定数グループ名を変更
   * @param oldConstantGroupName
   * @param newConstantGroupName
   */
  async changeConstantGroupName(oldConstantGroupName: string, newConstantGroupName: string) {
    if (oldConstantGroupName !== newConstantGroupName) {
      for (const output of this.outputs) {
        const index = output.constantsData.targets.indexOf(oldConstantGroupName)
        if (index >= 0) {
          output.constantsData.targets.splice(index, 1, newConstantGroupName)
          output.constantsData.targets.sort()
        }
      }
      await this.save()
    }
  }

  /**
   * 対象の定数グループを削除
   * @param constantGroupName
   */
  async deleteConstantGroupName(constantGroupName: string) {
    for (const output of this.outputs) {
      const index = output.constantsData.targets.indexOf(constantGroupName)
      if (index >= 0) {
        output.constantsData.targets.splice(index, 1)
      }
    }
    await this.save()
  }

  /**
   * リストを丸ごと置換する(JSON 直接編集用)
   */
  async replace({ schemas, enumerations, outputs }: { schemas?: DataStructRaw[]; enumerations?: EnumerationStructRaw[]; outputs?: OutputProjectRaw[] }) {
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
      for (const output of outputs.sort((a, b) => a.name.localeCompare(b.name))) {
        const { name, description, codeExtension, masterData, constantsData, entity, schema, enumeration, constant, others } = output
        this.outputs.push({ name, description, codeExtension, masterData, constantsData, entity, schema, enumeration, constant, others })
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
        await writeJsonFile<ProjectInfoRaw>(
          {
            name: this.name,
            description: this.description,
            schemas: this.schemas,
            enumerations: this.enumerations,
            outputs: this.outputs,
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
