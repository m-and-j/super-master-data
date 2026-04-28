import { DataObject, DataObjectColumn, EnumerationItem, EnumerationObject, OutputItem, OutputProject, ProjectInfo } from '@/systems/types'
import { LocalStorageKeys } from '@/utilities/defines'
import { readFile, writeFile } from '@tauri-apps/plugin-fs'

const createEmptyProject = (): ProjectInfo => ({
  name: '',
  description: '',
  tables: [],
  schemas: [],
  enumerations: [],
  outputs: [],
})

class Preferences {
  private loadingPromise: Promise<void> | undefined
  private projectInfo: ProjectInfo = createEmptyProject()
  private filePath: string | undefined

  /**
   * 前回使用したファイルパスを localStorage から読み出し、
   * 存在すればそのファイルからプロジェクトを読み込む
   */
  async load() {
    if (!this.loadingPromise) {
      this.loadingPromise = new Promise<void>(async (resolve) => {
        const savedPath = localStorage.getItem(LocalStorageKeys.FilePath) ?? undefined
        if (savedPath) {
          try {
            await this.readProjectFrom(savedPath)
            this.filePath = savedPath
          } catch (e) {
            console.error('前回のプロジェクトファイルの読み込みに失敗しました:', e)
          }
        }
        resolve()
      })
    }
    await this.loadingPromise
  }

  getProjectInfo() {
    return this.projectInfo
  }

  /**
   * 現在の保存先ファイルパス(未設定なら undefined)
   */
  getFilePath() {
    return this.filePath
  }

  existsFile() {
    return Boolean(this.filePath)
  }

  /**
   * 既存のプロジェクトファイルを開く
   * @param path
   */
  async openProject(path: string) {
    await this.readProjectFrom(path)
    this.setFilePath(path)
  }

  /**
   * 指定パスに空のプロジェクトを新規作成
   * @param path
   */
  async createNewProject(path: string) {
    this.projectInfo = createEmptyProject()
    this.setFilePath(path)
    await this.save()
  }

  /**
   * 現在のプロジェクトを別のパスに保存
   * 以後の保存先も切り替わる
   * @param path
   */
  async saveAs(path: string) {
    this.setFilePath(path)
    await this.save()
  }

  /**
   * プロジェクトのメタ情報(名前・説明)を更新して保存
   * @param name
   * @param description
   */
  async updateProjectMeta(name: string, description: string) {
    this.projectInfo.name = name
    this.projectInfo.description = description
    await this.save()
  }

  /**
   * テーブルデータ追加
   * @param name
   * @param description
   * @param columns
   */
  async addTable(name: string, description: string, columns: DataObjectColumn[]) {
    if (this.projectInfo.tables.some((t) => t.name === name)) {
      throw new Error('すでに同名のテーブルが存在します。')
    } else {
      const uuid = crypto.randomUUID()
      this.projectInfo.tables.push({ uuid, name, description, columns })
      this.projectInfo.tables.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
      return uuid
    }
  }

  /**
   * テーブルデータ更新
   * @param uuid
   * @param name
   * @param description
   * @param columns
   */
  async updateTable(uuid: string, name: string, description: string, columns: DataObjectColumn[]) {
    const table = this.projectInfo.tables.find((t) => t.uuid === uuid)
    if (table) {
      table.name = name
      table.description = description
      table.columns = columns
      await this.save()
    }
  }

  /**
   * テーブルデータ削除
   * @param uuid
   */
  async deleteTable(uuid: string) {
    this.projectInfo.tables = this.projectInfo.tables.filter((t) => t.uuid !== uuid)
    await this.save()
  }

  /**
   * スキーマ追加
   * @param name
   * @param description
   * @param columns
   */
  async addSchema(name: string, description: string, columns: DataObjectColumn[]) {
    if (this.projectInfo.schemas.some((s) => s.name === name)) {
      throw new Error('すでに同名のスキーマが存在します。')
    } else {
      const uuid = crypto.randomUUID()
      this.projectInfo.schemas.push({ uuid, name, description, columns })
      this.projectInfo.schemas.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
      return uuid
    }
  }

  /**
   * スキーマ更新
   * @param uuid
   * @param name
   * @param description
   * @param columns
   */
  async updateSchema(uuid: string, name: string, description: string, columns: DataObjectColumn[]) {
    const schema = this.projectInfo.schemas.find((s) => s.uuid === uuid)
    if (schema) {
      schema.name = name
      schema.description = description
      schema.columns = columns
      await this.save()
    }
  }

  /**
   * スキーマ削除
   * @param uuid
   */
  async deleteSchema(uuid: string) {
    this.projectInfo.schemas = this.projectInfo.schemas.filter((s) => s.uuid !== uuid)
    await this.save()
  }

  /**
   * 列挙型追加
   * @param name
   * @param description
   * @param items
   */
  async addEnumeration(name: string, description: string, items: EnumerationItem[]) {
    if (this.projectInfo.enumerations.some((e) => e.name === name)) {
      throw new Error('すでに同名の列挙型が存在します。')
    } else {
      const uuid = crypto.randomUUID()
      this.projectInfo.enumerations.push({ uuid, name, description, items })
      this.projectInfo.enumerations.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
      return uuid
    }
  }

  /**
   * 列挙型更新
   * @param uuid
   * @param name
   * @param description
   * @param items
   */
  async updateEnumeration(uuid: string, name: string, description: string, items: EnumerationItem[]) {
    const enumeration = this.projectInfo.enumerations.find((e) => e.uuid === uuid)
    if (enumeration) {
      enumeration.name = name
      enumeration.description = description
      enumeration.items = items
      await this.save()
    }
  }

  /**
   * 列挙型削除
   * @param uuid
   */
  async deleteEnumeration(uuid: string) {
    this.projectInfo.enumerations = this.projectInfo.enumerations.filter((e) => e.uuid !== uuid)
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
    if (this.projectInfo.outputs.some((e) => e.name === name)) {
      throw new Error('すでに同名の出力設定が存在します。')
    } else {
      const uuid = crypto.randomUUID()
      this.projectInfo.outputs.push({ uuid, name, description, dataPath, codeExtension, entity, schema, enumeration })
      this.projectInfo.outputs.sort((a, b) => a.name.localeCompare(b.name))
      await this.save()
      return uuid
    }
  }

  /**
   * 出力設定更新
   * @param uuid
   * @param name
   * @param description
   * @param dataPath
   * @param codeExtension
   * @param entity
   * @param schema
   * @param enumeration
   */
  async updateOutput(uuid: string, name: string, description: string, dataPath: string, codeExtension: string, entity: OutputItem, schema: OutputItem, enumeration: OutputItem) {
    const output = this.projectInfo.outputs.find((e) => e.uuid === uuid)
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
   * @param uuid
   */
  async deleteOutput(uuid: string) {
    this.projectInfo.outputs = this.projectInfo.outputs.filter((e) => e.uuid !== uuid)
    await this.save()
  }

  /**
   * リストを丸ごと置換する(JSON 直接編集用)
   */
  async replace({ tables, schemas, enumerations, outputs }: { tables?: DataObject[]; schemas?: DataObject[]; enumerations?: EnumerationObject[]; outputs?: OutputProject[] }) {
    this.projectInfo.tables = tables?.sort((a, b) => a.name.localeCompare(b.name)) ?? this.projectInfo.tables
    this.projectInfo.schemas = schemas?.sort((a, b) => a.name.localeCompare(b.name)) ?? this.projectInfo.schemas
    this.projectInfo.enumerations = enumerations?.sort((a, b) => a.name.localeCompare(b.name)) ?? this.projectInfo.enumerations
    this.projectInfo.outputs = outputs?.sort((a, b) => a.name.localeCompare(b.name)) ?? this.projectInfo.outputs
    for (const table of this.projectInfo.tables) {
      table.uuid ??= crypto.randomUUID()
    }
    for (const schema of this.projectInfo.schemas) {
      schema.uuid ??= crypto.randomUUID()
    }
    for (const enumeration of this.projectInfo.enumerations) {
      enumeration.uuid ??= crypto.randomUUID()
    }
    for (const output of this.projectInfo.outputs) {
      output.uuid ??= crypto.randomUUID()
    }
    await this.save()
  }

  private setFilePath(path: string) {
    this.filePath = path
    localStorage.setItem(LocalStorageKeys.FilePath, path)
  }

  private async readProjectFrom(path: string) {
    const contents = await readFile(path)
    const dataString = new TextDecoder().decode(contents)
    this.projectInfo = JSON.parse(dataString) as ProjectInfo
  }

  private async save() {
    if (this.filePath) {
      try {
        const jsonString = JSON.stringify(this.projectInfo, null, 2)
        const dataString = new TextEncoder().encode(jsonString)
        await writeFile(this.filePath, dataString)
      } catch (e) {
        console.error(e)
      }
    } else {
      // 保存先未設定 — ホーム画面で設定してもらう
      console.warn('保存先が未設定のため保存をスキップしました')
    }
  }
}

const preferences = new Preferences()
export default preferences
