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
   * 存在すればそのファイルからプロジェクトを読み込む。
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
   * 現在の保存先ファイルパス(未設定なら undefined)。
   */
  getFilePath() {
    return this.filePath
  }

  existsFile() {
    return Boolean(this.filePath)
  }

  /**
   * 既存のプロジェクトファイルを開く。
   */
  async openProject(path: string) {
    await this.readProjectFrom(path)
    this.setFilePath(path)
  }

  /**
   * 指定パスに空のプロジェクトを新規作成する。
   */
  async createNewProject(path: string) {
    this.projectInfo = createEmptyProject()
    this.setFilePath(path)
    await this.save()
  }

  /**
   * 現在のプロジェクトを別のパスに保存する(以後の保存先も切り替わる)。
   */
  async saveAs(path: string) {
    this.setFilePath(path)
    await this.save()
  }

  /**
   * プロジェクトのメタ情報(名前・説明)を更新して保存する。
   */
  async updateProjectMeta(name: string, description: string) {
    this.projectInfo.name = name
    this.projectInfo.description = description
    await this.save()
  }

  async addSchema(schema: DataObject) {
    this.projectInfo.schemas.push(schema)
    this.projectInfo.schemas.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  async updateSchema(name: string, schema: DataObject) {
    this.projectInfo.schemas = this.projectInfo.schemas.map((s) => (s.name === name ? schema : s))
    await this.save()
  }

  async addEnumeration(enumeration: EnumerationObject) {
    this.projectInfo.enumerations.push(enumeration)
    this.projectInfo.enumerations.sort((a, b) => a.name.localeCompare(b.name))
    await this.save()
  }

  async updateEnumeration(name: string, enumeration: EnumerationObject) {
    this.projectInfo.enumerations = this.projectInfo.enumerations.map((e) => (e.name === name ? enumeration : e))
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
