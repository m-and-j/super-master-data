import { DataObject, EnumerationObject, ProjectInfo } from '@/systems/types'
import { readFile, writeFile } from '@tauri-apps/plugin-fs'

const STORAGE_KEY = 'super-master-data.filePath'

const createEmptyProject = (): ProjectInfo => ({
  name: '',
  description: '',
  tables: [],
  schemas: [],
  enumerations: [],
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
        const savedPath = localStorage.getItem(STORAGE_KEY) ?? undefined
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
   * @param schema
   */
  async addTable(table: DataObject) {
    this.projectInfo.tables.push(table)
    this.projectInfo.tables.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  /**
   * テーブルデータ更新
   * @param name
   * @param schema
   */
  async updateTable(name: string, table: DataObject) {
    this.projectInfo.tables = this.projectInfo.tables.map((t) => (t.name === name ? table : t))
    await this.save()
  }

  /**
   * スキーマ追加
   * @param schema
   */
  async addSchema(schema: DataObject) {
    this.projectInfo.schemas.push(schema)
    this.projectInfo.schemas.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  /**
   * スキーマ更新
   * @param name
   * @param schema
   */
  async updateSchema(name: string, schema: DataObject) {
    this.projectInfo.schemas = this.projectInfo.schemas.map((s) => (s.name === name ? schema : s))
    await this.save()
  }

  /**
   * 列挙型追加
   * @param enumeration
   */
  async addEnumeration(enumeration: EnumerationObject) {
    this.projectInfo.enumerations.push(enumeration)
    this.projectInfo.enumerations.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  /**
   * 列挙型更新
   * @param name
   * @param enumeration
   */
  async updateEnumeration(name: string, enumeration: EnumerationObject) {
    this.projectInfo.enumerations = this.projectInfo.enumerations.map((e) => (e.name === name ? enumeration : e))
    await this.save()
  }

  /**
   * テーブルリストを丸ごと置換する(JSON 直接編集用)
   */
  async replaceTables(tables: DataObject[]) {
    this.projectInfo.tables = tables.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  /**
   * スキーマリストを丸ごと置換する(JSON 直接編集用)
   */
  async replaceSchemas(schemas: DataObject[]) {
    this.projectInfo.schemas = schemas.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  /**
   * 列挙型リストを丸ごと置換する(JSON 直接編集用)
   */
  async replaceEnumerations(enumerations: EnumerationObject[]) {
    this.projectInfo.enumerations = enumerations.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  private setFilePath(path: string) {
    this.filePath = path
    localStorage.setItem(STORAGE_KEY, path)
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
