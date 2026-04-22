import { DataObject, EnumerationObject, ProjectInfo } from '@/systems/types'
import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs'

class Preferences {
  private loadingPromise: Promise<void> | undefined
  private projectInfo: ProjectInfo = { name: '', description: '', tables: [], schemas: [], enumerations: [] }

  async load() {
    if (!this.loadingPromise) {
      this.loadingPromise = new Promise<void>(async (resolve) => {
        try {
          const contents = await readFile('hoge.json', { baseDir: BaseDirectory.Document })
          const dataString = new TextDecoder().decode(contents)
          this.projectInfo = JSON.parse(dataString) as ProjectInfo
        } catch (e) {
          console.error(e)
        }
        resolve()
      })
    }
    await this.loadingPromise
  }

  getProjectInfo() {
    return this.projectInfo
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

  private async save() {
    try {
      const jsonString = JSON.stringify(this.projectInfo, null, 2)
      const dataString = new TextEncoder().encode(jsonString)
      await writeFile('hoge.json', dataString, { baseDir: BaseDirectory.Document })
    } catch (e) {
      console.error(e)
    }
  }
}

const preferences = new Preferences()
export default preferences
