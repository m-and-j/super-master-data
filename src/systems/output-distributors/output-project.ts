import { masterConstantsAccessor } from '@/systems/accessors/master-constants-accessor'
import { masterDataAccessor } from '@/systems/accessors/master-data-accessor'
import { masterListAccessor } from '@/systems/accessors/master-list-accessor'
import { cacheStore } from '@/systems/cache-store'
import { OutputKind } from '@/systems/defines'
import { preferences } from '@/systems/preferences'
import { OutputProjectOtherRaw, OutputProjectRaw, OutputProjectStandardRaw } from '@/systems/types'
import { deepCopy } from '@/utilities/helper'
import { path } from '@tauri-apps/api'

export class OutputProject {
  private uuid: string
  private name = ''
  private description = ''
  private codeExtension = ''
  private masterData = new OutputData()
  private masterList = new OutputData()
  private masterConstants = new OutputData()
  private entity: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private schema: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private enumeration: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private constant: OutputProjectStandardRaw = { path: '', fileNameTemplate: '{{filename}}', sourceCodeTemplate: '' }
  private others: OutputProjectOtherRaw[] = []

  constructor(raw?: OutputProjectRaw) {
    if (raw) {
      const copy = deepCopy(raw)
      this.uuid = copy.uuid || crypto.randomUUID()
      this.name = copy.name
      this.description = copy.description
      this.codeExtension = copy.codeExtension
      this.masterData.setRaw(copy.masterData.path, copy.masterData.targets)
      this.masterList.setRaw(copy.masterList.path, copy.masterList.targets)
      this.masterConstants.setRaw(copy.masterConstants.path, copy.masterConstants.targets)
      this.entity = copy.entity
      this.schema = copy.schema
      this.enumeration = copy.enumeration
      this.constant = copy.constant
      this.others = copy.others
    } else {
      this.uuid = crypto.randomUUID()
    }
  }

  getName() {
    return this.name
  }

  getDescription() {
    return this.description
  }

  getCodeExtension() {
    return this.codeExtension
  }

  getMasterData() {
    return this.masterData
  }

  getMasterList() {
    return this.masterList
  }

  getMasterConstants() {
    return this.masterConstants
  }

  getEntity() {
    return this.entity
  }

  getSchema() {
    return this.schema
  }

  getEnumeration() {
    return this.enumeration
  }

  getConstant() {
    return this.constant
  }

  getOthers() {
    return this.others
  }

  getOther(index: number) {
    return this.others[index]
  }

  tryGetBasePath() {
    return cacheStore.getOutputFolderPath(preferences.getProjectInfo().uuid, this.uuid).getValue() ?? preferences.getFolderPath()
  }

  saveBasePath(newBasePath: string) {
    cacheStore.getOutputFolderPath(preferences.getProjectInfo().uuid, this.uuid).setValue(newBasePath)
  }

  clearBasePath() {
    cacheStore.getOutputFolderPath(preferences.getProjectInfo().uuid, this.uuid).remove()
  }

  async getMasterDataPath() {
    return await path.join(this.getBasePath(), this.masterData.getPath())
  }

  async getMasterListPath() {
    return await path.join(this.getBasePath(), this.masterList.getPath())
  }

  async getMasterConstantsPath() {
    return await path.join(this.getBasePath(), this.masterConstants.getPath())
  }

  async getEntityPath() {
    return await path.join(this.getBasePath(), this.entity.path)
  }

  async getSchemaPath() {
    return await path.join(this.getBasePath(), this.schema.path)
  }

  async getEnumerationPath() {
    return await path.join(this.getBasePath(), this.enumeration.path)
  }

  async getConstantPath() {
    return await path.join(this.getBasePath(), this.constant.path)
  }

  async getOtherPath(index: number) {
    return await path.join(this.getBasePath(), this.others[index].path)
  }

  toRaw(): OutputProjectRaw {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      codeExtension: this.codeExtension,
      masterData: this.masterData.toRaw(masterDataAccessor.getNames()),
      masterList: this.masterList.toRaw(masterListAccessor.getNames()),
      masterConstants: this.masterConstants.toRaw(masterConstantsAccessor.getNames()),
      entity: this.entity,
      schema: this.schema,
      enumeration: this.enumeration,
      constant: this.constant,
      others: this.others,
    }
  }

  changeName(e: Event) {
    this.name = (e.target as HTMLInputElement).value
  }

  changeDescription(e: Event) {
    this.description = (e.target as HTMLInputElement).value
  }

  changeCodeExtension(e: Event) {
    this.codeExtension = (e.target as HTMLInputElement).value
  }

  addOther() {
    this.others.push({ name: '新規出力', kind: OutputKind.Single, path: '', sourceCodeTemplate: '' })
    return this.others.length - 1
  }

  removeOther(index: number) {
    this.others.splice(index, 1)
  }

  private getBasePath() {
    const basePath = this.tryGetBasePath()
    if (basePath) {
      return basePath
    } else {
      throw new Error('プロジェクトフォルダが設定されていません')
    }
  }
}

export class OutputData {
  private path = ''
  private targets = new Set<string>()

  setRaw(path: string, targets: string[]) {
    this.path = path
    this.targets = new Set(targets)
  }

  getPath() {
    return this.path
  }

  toRaw(targetList: string[]) {
    const targets = Array.from(this.targets)
      .filter((name) => targetList.includes(name))
      .sort()
    return { path: this.path, targets }
  }

  hasTarget(name: string) {
    return this.targets.has(name)
  }

  changePath(e: Event) {
    this.path = (e.target as HTMLInputElement).value
  }

  changeTarget(e: Event) {
    const checkbox = e.target as HTMLInputElement
    if (checkbox.checked) {
      this.targets.add(checkbox.value)
    } else {
      this.targets.delete(checkbox.value)
    }
  }

  allCheckTargets(targetList: string[]) {
    targetList.forEach((name) => this.targets.add(name))
  }

  allClearTargets() {
    this.targets.clear()
  }
}
